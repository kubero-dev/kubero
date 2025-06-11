import { Global, Module } from '@nestjs/common';
import { KubernetesService } from './kubernetes.service';
import { KubernetesController } from './kubernetes.controller';

@Global()
@Module({
  providers: [KubernetesService],
  exports: [KubernetesService],
  controllers: [KubernetesController],
})
export class KubernetesModule {}
