import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SecurityService } from './security.service';

/** Records finished scans, sends notifications and starts the rescans that a policy asks for. */
@Injectable()
export class SecurityScheduler {
  private logger = new Logger(SecurityScheduler.name);
  private running = false;

  constructor(private securityService: SecurityService) {}

  @Cron('0 */30 * * * *')
  async refresh() {
    if (this.running || process.env.KUBERO_READONLY === 'true') {
      return;
    }
    this.running = true;
    try {
      await this.securityService.refreshAll(['admin']);
    } catch (error) {
      this.logger.error(error);
    } finally {
      this.running = false;
    }
  }
}
