import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { AppsModule} from '../apps/apps.module';
@Module({
  controllers: [SecurityController],
  imports: [AppsModule],
  providers: [SecurityService, KubernetesModule, PipelinesModule],
})
export class SecurityModule {}
