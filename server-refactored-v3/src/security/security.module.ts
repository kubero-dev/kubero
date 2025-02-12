import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { AppsService } from '../apps/apps.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from 'src/events/events.gateway';

@Module({
  controllers: [SecurityController],
  providers: [SecurityService, KubernetesModule, PipelinesModule, AppsService, NotificationsService, EventsGateway],
})
export class SecurityModule {}
