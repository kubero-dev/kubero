import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { Kubectl } from '../kubectl/kubectl';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, Kubectl]
})
export class SettingsModule {}
