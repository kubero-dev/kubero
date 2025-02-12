import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { AppsService } from '../apps/apps.service';
@Module({
  controllers: [SecurityController],
  providers: [SecurityService, KubernetesModule, PipelinesModule, AppsService],
})
export class SecurityModule {}
