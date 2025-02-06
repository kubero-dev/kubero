import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { Kubectl } from '../kubernetes/kubernetes.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, Kubectl]
})
export class SettingsModule {}
