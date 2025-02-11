import { Global, Module } from '@nestjs/common';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from 'src/events/events.gateway';

@Global()
@Module({
  controllers: [PipelinesController],
  providers: [PipelinesService, NotificationsService, EventsGateway],
  exports: [PipelinesService],
})
export class PipelinesModule {}
