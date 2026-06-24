import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Command({
  name: 'reset-admin',
  description: 'Reset the admin account with a new random password',
})
@Injectable()
export class ResetAdminCommand extends CommandRunner {
  private readonly logger = new Logger(ResetAdminCommand.name);

  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Resetting admin account...');

    try {
      await this.databaseService.resetAdminUser();
      this.logger.log('Admin account has been reset successfully');
    } catch (error) {
      this.logger.error('Failed to reset admin account', error);
      process.exit(1);
    }

    process.exit(0);
  }
}
