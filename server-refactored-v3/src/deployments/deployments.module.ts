import { Module } from '@nestjs/common';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsService } from './deployments.service';
import { AppsService } from '../apps/apps.service';
import { LogsService } from '../logs/logs.service';

@Module({
  controllers: [DeploymentsController],
  providers: [DeploymentsService, AppsService, LogsService],
})
export class DeploymentsModule {}
