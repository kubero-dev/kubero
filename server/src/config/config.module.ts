import { Global, Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Global()
@Module({
  imports: [KubernetesModule, NotificationsModule],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
