import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { AppsController } from './apps.controller';
import { PipelinesService } from '../pipelines/pipelines.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

@Module({
  providers: [AppsService, KubernetesModule, PipelinesService, NotificationsService, EventsGateway],
  exports: [AppsService],
  controllers: [AppsController],
})
export class AppsModule {}
