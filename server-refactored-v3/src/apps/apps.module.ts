import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { PipelinesService } from '../pipelines/pipelines.service';

@Module({
  providers: [AppsService, KubernetesModule, PipelinesService],
  exports: [AppsService],
})
export class AppsModule {}
