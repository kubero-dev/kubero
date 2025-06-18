import { Global, Module, Logger } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { PrismaClient } from '@prisma/client';

DatabaseService.Init(); // configing the database connection initialization

@Global()
@Module({
  providers: [
    DatabaseService,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [DatabaseService, PrismaClient],
})
export class DatabaseModule {}

