import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EventsGateway } from '../events/events.gateway';
import { AuditModule } from '../audit/audit.module';
import { KubernetesModule } from '../kubernetes/kubernetes.module';

@Global()
@Module({
  providers: [NotificationsService, EventsGateway, AuditModule, KubernetesModule],
  exports: [NotificationsService],
})
export class NotificationsModule {}
