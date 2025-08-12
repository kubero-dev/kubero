import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { runpacks } from './runpacks.seed'; // Assuming runpacks.seed.ts exports a Runpack type
import { podsizes } from './podsizes.seed'; // Assuming podsizes.seed.ts exports a PodSize type
import * as yaml from 'yaml'; // Import yaml for parsing runpacks

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

    this.seedRunpacks();
    this.seedPodSizes();
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
    const userGroups = ['everyone', 'admin'];

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

  /**
   * Resets the admin user account with a new random password.
   * If the admin user doesn't exist, it creates one.
   * Prints the new username and password to the console.
   * @returns {Promise<void>}
   */
  async resetAdminUser(): Promise<void> {
    const prisma = new PrismaClient();
    const adminUser = process.env.KUBERO_ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.KUBERO_ADMIN_EMAIL || 'admin@kubero.dev';
    const role = process.env.KUBERO_SYSTEM_USER_ROLE || 'admin';
    const userGroups = ['everyone', 'admin'];

    try {
      // Generate a random password
      const plainPassword = crypto
        .randomBytes(25)
        .toString('base64')
        .slice(0, 19);
      // Create bcrypt hash
      const passwordHash = await bcrypt.hash(plainPassword, 10);
      
      // Check if admin user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: '2' },
      });
      
      if (existingUser) {
        // Update existing admin user
        await prisma.user.update({
          where: { id: '2' },
          data: {
            password: passwordHash,
            updatedAt: new Date(),
          },
        });
        console.log('\n\n\n', 'Admin account has been reset');
      } else {
        // Create new admin user
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
        console.log('\n\n\n', 'New admin account created');
      }
      
      console.log('  username: ', adminUser);
      console.log('  password: ', plainPassword);
      console.log('  email:    ', adminEmail, '\n\n\n');
      
      this.logger.log('Admin user reset successfully.');
      return;
    } catch (error) {
      this.logger.error('Failed to reset admin user.', error);
      throw error;
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
              { action: 'write', resource: 'app' },
              { action: 'write', resource: 'pipeline' },
              { action: 'write', resource: 'user' },
              { action: 'write', resource: 'config' },
              { action: 'ok',    resource: 'console' },
              { action: 'ok',    resource: 'logs' },
              { action: 'ok',    resource: 'reboot' },
              { action: 'read',  resource: 'audit' },
              { action: 'write', resource: 'token' },
              { action: 'write', resource: 'security' },
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
              { action: 'write', resource: 'app' },
              { action: 'write', resource: 'pipeline' },
              { action: 'read',  resource: 'user' },
              { action: 'none',  resource: 'config' },
              { action: 'ok',    resource: 'console' },
              { action: 'ok',    resource: 'logs' },
              { action: 'ok',    resource: 'reboot' },
              { action: 'read',  resource: 'audit' },
              { action: 'ok', resource: 'token' },
              { action: 'write', resource: 'security' },
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
              { action: 'none', resource: 'user' },
              { action: 'none', resource: 'config' },
              { action: 'none', resource: 'console' },
              { action: 'none', resource: 'logs' },
              { action: 'none', resource: 'reboot' },
              { action: 'read', resource: 'audit' },
              { action: 'none', resource: 'token' },
              { action: 'read', resource: 'security' },
            ],
          },
        },
      })
      .then(() => {
        this.logger.log('Role "guest" seeded successfully.');
      });

    // Ensure the 'everyone' user group exists
    this.prisma.userGroup
    .upsert({
      where: { name: 'everyone' },
      update: {},
      create: {
        name: 'everyone',
        description: 'Standard group for all users',
      },
    })
    .then(() => {
      this.logger.log('UserGroup "everyone" seeded successfully.');
    });

    // Ensure the 'admin' user group exists
    this.prisma.userGroup
      .upsert({
        where: { name: 'admin' },
        update: {},
        create: {
          name: 'admin',
          description: 'Group for admin users',
        },
      })
      .then(() => {
        this.logger.log('UserGroup "admin" seeded successfully.');
      });

    this.logger.log('Default data seeded successfully.');
  }

  private async seedRunpacks() {
    const config = yaml.parse(runpacks);

    const buildpacks = config || [];
    for (const bp of buildpacks) {
      // Find existing by name
      const existing = await this.prisma.runpack.findFirst({ where: { name: bp.name } });
      const prisma = this.prisma;
      const createPhase = async (phase: any) => {
        // Create SecurityContext
        const sec = await prisma.securityContext.create({
          data: {
            runAsUser: phase.securityContext.runAsUser,
            runAsGroup: phase.securityContext.runAsGroup,
            runAsNonRoot: phase.securityContext.runAsNonRoot,
            readOnlyRootFilesystem: phase.securityContext.readOnlyRootFilesystem,
            allowPrivilegeEscalation: phase.securityContext.allowPrivilegeEscalation,
            capabilities: {
              create: [{
                add: { create: (phase.securityContext.capabilities?.add || []).map((v: string) => ({ value: v })) },
                drop: { create: (phase.securityContext.capabilities?.drop || []).map((v: string) => ({ value: v })) },
              }],
            },
          },
        });
        // Create RunpackPhase
        return await prisma.runpackPhase.create({
          data: {
            repository: phase.repository,
            tag: phase.tag,
            command: phase.command || '',
            readOnlyAppStorage: phase.readOnlyAppStorage,
            securityContextId: sec.id,
          },
        });
      };
      const fetchPhase = await createPhase(bp.fetch);
      const buildPhase = await createPhase(bp.build);
      const runPhase = await createPhase(bp.run);
      if (existing) {
        // Optionally update here
        this.logger.log(`Runpack/Buildpack '${bp.name}' already exists. Skipping.`);
        continue;
      }
      await this.prisma.runpack.create({
        data: {
          name: bp.name,
          language: bp.language,
          fetchId: fetchPhase.id,
          buildId: buildPhase.id,
          runId: runPhase.id,
        },
      });
      this.logger.log(`Runpack/Buildpack '${bp.name}' seeded.`);
    }
    this.logger.log('Buildpacks/Runpacks seeded successfully.');
  }

  private async seedPodSizes() {
    const config = yaml.parse(podsizes);
    // seed pod sizes if the table is empty
    const existingSizes = await this.prisma.podSize.count();
    if (existingSizes > 0) {
      this.logger.log('Pod sizes already exist. Skipping seeding.');
      return;
    }
    for (const size of config) {
      await this.prisma.podSize.create({
        data: {
          name: size.name,
          description: size.description,
          cpuLimit: size.resources.limits.cpu,
          memoryLimit: size.resources.limits.memory,
          cpuRequest: size.resources.requests.cpu,
          memoryRequest: size.resources.requests.memory,
        },
      });
      this.logger.log(`Pod size '${size.name}' seeded successfully.`);
    }
    this.logger.log('Pod sizes seeded successfully.');
  }
}
