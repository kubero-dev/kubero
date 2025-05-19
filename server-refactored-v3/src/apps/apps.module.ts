import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { AppsController } from './apps.controller';
import { PipelinesService } from '../pipelines/pipelines.service';

@Module({
  providers: [AppsService, KubernetesModule, PipelinesService],
  exports: [AppsService],
  controllers: [AppsController],
})
export class AppsModule {}
