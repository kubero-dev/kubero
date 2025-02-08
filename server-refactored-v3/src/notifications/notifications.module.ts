import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EventsGateway } from '../events/events.gateway';
import { AuditModule } from '../audit/audit.module';
import { KubernetesModule } from '../kubernetes/kubernetes.module';

@Module({
  providers: [NotificationsService, EventsGateway, AuditModule, KubernetesModule],
})
export class NotificationsModule {}
