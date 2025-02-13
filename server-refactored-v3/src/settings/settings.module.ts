import { Global, Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';

@Global()
@Module({
  controllers: [SettingsController],
  providers: [SettingsService, KubernetesModule],
  exports: [SettingsService],
})
export class SettingsModule {}
