import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuditModule } from '../audit/audit.module';
import { KubernetesModule } from '../kubernetes/kubernetes.module';

@Global()
@Module({
  providers: [NotificationsService, AuditModule, KubernetesModule],
  exports: [NotificationsService],
})
export class NotificationsModule {}
