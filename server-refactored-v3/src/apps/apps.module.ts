import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { PipelinesService } from '../pipelines/pipelines.service';
import { AppsController } from './apps.controller';

@Module({
  providers: [AppsService, KubernetesModule, PipelinesService],
  exports: [AppsService],
  controllers: [AppsController],
})
export class AppsModule {}
