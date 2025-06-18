import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; 

@Injectable()
export class DatabaseService {

  public static async Init() {
    if (process.env.DATABASE_URL === '' || process.env.DATABASE_URL === undefined) {
      process.env.DATABASE_URL = 'file:../db/kubero.sqlite';
      process.env.DATABASE_TYPE = 'sqlite';
      Logger.debug(
        'DATABASE_URL is not set. Using SQLite database: ' + process.env.DATABASE_URL,
        'DatabaseService',
      );
    }
  }
  
  public static async RunMigrations() {

    await this.Init();
    
    const prisma = new PrismaClient();
    
    try {
      Logger.log('Running Prisma migrations...', 'Bootstrap');
      // @ts-ignore
      await prisma.$executeRawUnsafe?.('PRAGMA foreign_keys=OFF;'); // For SQLite, optional
      await prisma.$disconnect();
      // Use CLI for migrations
      const { execSync } = await import('child_process');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      Logger.log('Prisma migrations completed.', 'Bootstrap');
    } catch (err) {
      Logger.error('Prisma migration failed', err, 'Bootstrap');
      process.exit(1);
    }
  }
}
