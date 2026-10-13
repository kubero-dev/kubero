import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { AppsController } from './apps.controller';
import { PipelinesService } from '../pipelines/pipelines.service';
import { RegistryModule } from '../registry/registry.module';

@Module({
  providers: [AppsService, KubernetesModule, PipelinesService],
  exports: [AppsService],
  controllers: [AppsController],
  imports: [RegistryModule]
})
export class AppsModule {}
