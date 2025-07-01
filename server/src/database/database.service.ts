import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseService {
  private logger = new Logger(DatabaseService.name);
  private readonly prisma = new PrismaClient();

  constructor() {
    // Initialize the Prisma client
    this.prisma
      .$connect()
      .then(() => {
        this.logger.log('Connected to the database successfully.');
      })
      .catch((error) => {
        this.logger.error('Failed to connect to the database.', error);
      });
    this.runMigrations()
      .then(() => {
        // create user after migrations
        this.seedDefaultData().then(() => {
          this.createSystemUser();
          this.createAdminUser();
          this.migrateLegeacyUsers();
        });
      })
      .catch((error) => {
        this.logger.error('Error during database migrations.', error);
      });
  }

  private async init() {
    if (
      process.env.DATABASE_URL === '' ||
      process.env.DATABASE_URL === undefined
    ) {
      process.env.DATABASE_URL = 'file:../db/kubero.sqlite';
      process.env.DATABASE_TYPE = 'sqlite';
      Logger.debug(
        'DATABASE_URL is not set. Using SQLite database: ' +
          process.env.DATABASE_URL,
        'DatabaseService',
      );
    }
  }

  private async runMigrations() {
    const { execSync } = await import('child_process');

    await this.init();

    const prisma = new PrismaClient();

    try {
      this.logger.log('Running Prisma migrations...');
      // @ts-ignore
      await prisma.$executeRawUnsafe?.('PRAGMA foreign_keys=OFF;'); // For SQLite, optional
      // Use CLI for migrations
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      //execSync('npx prisma migrate deploy', {});
      this.logger.log('Prisma migrations completed.');
      //await prisma.$disconnect();
    } catch (err) {
      this.logger.error('Prisma migration failed', err);
      process.exit(1);
    }
  }

  private async createSystemUser() {
    const prisma = new PrismaClient();

    // Check if the system user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: '1' },
    });
    if (existingUser) {
      this.logger.log('System user already exists. Skipping creation.');
      return;
    }

    const role = process.env.KUBERO_SYSTEM_USER_ROLE || 'guest';
    const userGroups = ['everyone'];
    try {
      await prisma.user.create({
        data: {
          id: '1',
          username: 'system',
          email: 'system@kubero.dev',
          password: '', // No password for system user
          isActive: false,
          role: { connect: { name: role } },
          userGroups:
            userGroups && Array.isArray(userGroups)
              ? {
                  connect: userGroups.map((g: any) => ({ name: g })),
                }
              : undefined,
        },
      });
      this.logger.log('System user created successfully.');
    } catch (error) {
      this.logger.error('Failed to create system user.', error);
    }
  }

  private async createAdminUser() {
    const prisma = new PrismaClient();

    // Check if the admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: '2' },
    });
    if (existingUser) {
      this.logger.log('Admin user already exists. Skipping creation.');
      return;
    }

    const adminUser = process.env.KUBERO_ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.KUBERO_ADMIN_EMAIL || 'admin@kubero.dev';
    const role = process.env.KUBERO_SYSTEM_USER_ROLE || 'admin';
    const userGroups = ['everyone'];

    try {
      // Generiere ein zufälliges Passwort
      const plainPassword = crypto
        .randomBytes(25)
        .toString('base64')
        .slice(0, 19);
      // Erstelle einen bcrypt-Hash
      const passwordHash = await bcrypt.hash(plainPassword, 10);
      console.log('\n\n\n', 'Admin account created since no user exists yet');
      console.log('  username: ', adminUser);
      console.log('  password: ', plainPassword);
      console.log('  email:    ', adminEmail, '\n\n\n');

      await prisma.user.create({
        data: {
          id: '2',
          username: adminUser,
          email: adminEmail,
          password: passwordHash,
          isActive: true,
          role: { connect: { name: role } },
          userGroups:
            userGroups && Array.isArray(userGroups)
              ? {
                  connect: userGroups.map((g: any) => ({ name: g })),
                }
              : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      this.logger.log('Admin user created successfully.');
    } catch (error) {
      Logger.error('Failed to create admin user.', error);
    }
  }

  private async migrateLegeacyUsers() {
    const prisma = new PrismaClient();

    const existingUsers = await prisma.user.count();
    if (existingUsers > 2) {
      this.logger.log('Legacy users already migrated. Skipping migration.');
      return;
    }

    if (!process.env.KUBERO_USERS || process.env.KUBERO_USERS === '') {
      this.logger.log('No legacy users to migrate. KUBERO_USERS is not set.');
      return;
    }

    const u = Buffer.from(process.env.KUBERO_USERS, 'base64').toString('utf-8');
    const users = JSON.parse(u);

    for (const user of users) {
      let password = user.password;
      if (
        user.insecure &&
        user.insecure === true &&
        process.env.KUBERO_SESSION_KEY
      ) {
        this.logger.warn(
          'User with unencrypted Password detected: "' +
            user.username +
            '" - This feature is deprecated and will be removed in the future',
        );
        password = crypto
          .createHmac('sha256', process.env.KUBERO_SESSION_KEY)
          .update(password)
          .digest('hex');
      }

      const userID = crypto.randomUUID();
      const role = process.env.KUBERO_DEFAULT_USER_ROLE || 'guest';
      const userGroups = ['everyone'];
      try {
        await prisma.user.create({
          data: {
            id: userID,
            username: user.username,
            email: user.username + '@kubero.dev',
            password: password,
            isActive: true,
            role: { connect: { name: role } },
            userGroups:
              userGroups && Array.isArray(userGroups)
                ? {
                    connect: userGroups.map((g: any) => ({ name: g })),
                  }
                : undefined,
          },
        });
        this.logger.log(`Migrated user ${user.username} successfully.`);
      } catch (error) {
        this.logger.error(`Failed to migrate user ${user.username}.`, error);
      }
    }

    this.logger.log('Legacy users migrated successfully.');
  }

  private async seedDefaultData() {
    // Ensure the 'admin' role exists with permissions
    this.prisma.role
      .upsert({
        where: { name: 'admin' },
        update: {},
        create: {
          name: 'admin',
          description: 'Administrator role with full access',
          permissions: {
            create: [
              { action: 'write', resource: 'user' },
              { action: 'write', resource: 'pipeline' },
              { action: 'write', resource: 'app' },
              { action: 'write', resource: 'settings' },
              { action: 'write', resource: 'templates' },
            ],
          },
        },
      })
      .then(() => {
        this.logger.log('Role "admin" seeded successfully.');
      });

    // Ensure the 'member' role exists with limited permissions
    this.prisma.role
      .upsert({
        where: { name: 'member' },
        update: {},
        create: {
          name: 'member',
          description: 'Member role with limited access',
          permissions: {
            create: [
              { action: 'read', resource: 'user' },
              { action: 'write', resource: 'pipeline' },
              { action: 'write', resource: 'app' },
              { action: 'write', resource: 'templates' },
            ],
          },
        },
      })
      .then(() => {
        this.logger.log('Role "member" seeded successfully.');
      });

    // Ensure the 'guest' role exists with minimal permissions
    this.prisma.role
      .upsert({
        where: { name: 'guest' },
        update: {},
        create: {
          name: 'guest',
          description: 'Guest role with minimal access',
          permissions: {
            create: [
              { action: 'read', resource: 'app' },
              { action: 'read', resource: 'pipeline' },
              { action: 'read', resource: 'templates' },
            ],
          },
        },
      })
      .then(() => {
        this.logger.log('Role "guest" seeded successfully.');
      });

    // Ensure the 'everyone' user group exists
    const existingGroup = await this.prisma.userGroup.findUnique({
      where: { name: 'everyone' },
    });

    if (!existingGroup) {
      await this.prisma.userGroup.create({
        data: {
          name: 'everyone',
          description: 'Standard group for all users',
        },
      });
      this.logger.log('UserGroup "everyone" created successfully.');
    } else {
      this.logger.log(
        'UserGroup "everyone" already exists. Skipping creation.',
      );
    }

    this.logger.log('Default data seeded successfully.');
  }
}
