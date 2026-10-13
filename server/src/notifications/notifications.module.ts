import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsDbService } from './notifications-db.service';
import { NotificationsController } from './notifications.controller';
import { AuditModule } from '../audit/audit.module';
import { KubernetesModule } from '../kubernetes/kubernetes.module';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsDbService,
    AuditModule,
    KubernetesModule,
  ],
  exports: [NotificationsService, NotificationsDbService],
})
export class NotificationsModule {}
