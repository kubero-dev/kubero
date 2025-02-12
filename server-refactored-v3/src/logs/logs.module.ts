import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from 'src/notifications/notifications.service';
import { AppsService } from 'src/apps/apps.service';
import { LogsController } from './logs.controller';

@Module({
  providers: [LogsService, EventsGateway, NotificationsService, AppsService],
  controllers: [LogsController]
})
export class LogsModule {}
