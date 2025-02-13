import { Module } from '@nestjs/common';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsService } from './deployments.service';
import { AppsService } from 'src/apps/apps.service';
import { EventsGateway } from 'src/events/events.gateway';
import { LogsService } from 'src/logs/logs.service';

@Module({
  controllers: [DeploymentsController],
  providers: [DeploymentsService, AppsService, LogsService],
})
export class DeploymentsModule {}
