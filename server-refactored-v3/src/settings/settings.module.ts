import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { KubernetesModule  } from '../kubernetes/kubernetes.module';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, KubernetesModule],
})
export class SettingsModule {}
