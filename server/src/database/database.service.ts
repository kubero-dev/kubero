import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseService {

  private static readonly logger = new Logger(DatabaseService.name);
  private static readonly prisma = new PrismaClient();

  constructor() {
    // Initialize the Prisma client
    DatabaseService.prisma.$connect()
      .then(() => {
        DatabaseService.logger.log('Connected to the database successfully.');
      })
      .catch((error) => {
        DatabaseService.logger.error('Failed to connect to the database.', error);
      });
    this.runMigrations()
      .then(() => {
        // create user after migrations
        this.createAdminUser()
      })
      .catch((error) => {
        DatabaseService.logger.error('Error during database migrations.', error);
      });
  }

  private async init() {
    if (process.env.DATABASE_URL === '' || process.env.DATABASE_URL === undefined) {
      process.env.DATABASE_URL = 'file:../db/kubero.sqlite';
      process.env.DATABASE_TYPE = 'sqlite';
      Logger.debug(
        'DATABASE_URL is not set. Using SQLite database: ' + process.env.DATABASE_URL,
        'DatabaseService',
      );
    }
  }
  
  private async runMigrations() {
    const { execSync } = await import('child_process');

    await this.init();
    
    const prisma = new PrismaClient();
    
    try {
      Logger.log('Running Prisma migrations...', 'Bootstrap');
      // @ts-ignore
      await prisma.$executeRawUnsafe?.('PRAGMA foreign_keys=OFF;'); // For SQLite, optional
      // Use CLI for migrations
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      //execSync('npx prisma migrate deploy', {});
      Logger.log('Prisma migrations completed.', 'Bootstrap');
      await prisma.$executeRaw`
        INSERT INTO "User" (
          "id", 
          "email", 
          "username", 
          "password", 
          "isActive",
          createdAt,
          updatedAt
        ) VALUES (
          "1", 
          'system@kubero.dev', 
          'system', 
          '', 
          false,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ) ON CONFLICT DO NOTHING;`
      await prisma.$disconnect();
    } catch (err) {
      Logger.error('Prisma migration failed', err, 'Bootstrap');
      process.exit(1);
    }
  }

  private async createAdminUser() {
    const prisma = new PrismaClient();
    
    // Check if the admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: '2' },
    });
    if (existingUser) {
      Logger.log('Admin user already exists. Skipping creation.', 'DatabaseService');
      return;
    }

    const adminUser = process.env.KUBERO_ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.KUBERO_ADMIN_EMAIL || 'admin@kubero.dev';

    try {

      // Generiere ein zufälliges Passwort
      const plainPassword = crypto.randomBytes(25).toString('base64').slice(0, 19);
      // Erstelle einen bcrypt-Hash
      const passwordHash = await bcrypt.hash(plainPassword, 10);
      console.log('\n\n\n', 'Admin account created since no user exists yet');
      console.log('Please change the password after the first login.');
      console.log('Admin credentials:');
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      Logger.log('Admin user created successfully.', 'DatabaseService');
    } catch (error) {
      Logger.error('Failed to create admin user.', error, 'DatabaseService');
    }
    await prisma.$disconnect();
  }
}
