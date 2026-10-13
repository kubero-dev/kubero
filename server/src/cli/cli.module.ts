import { Module } from '@nestjs/common';
import { ResetAdminCommand } from './commands/reset-admin.command';
import { DatabaseService } from '../database/database.service';

@Module({
  providers: [ResetAdminCommand, DatabaseService],
})
export class CliModule {}
