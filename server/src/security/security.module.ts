import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { AppsService } from '../apps/apps.service';
import { SecurityScheduler } from './security.scheduler';
@Module({
  controllers: [SecurityController],
  providers: [SecurityService, SecurityScheduler, KubernetesModule, PipelinesModule, AppsService],
})
export class SecurityModule {}
