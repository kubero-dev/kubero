import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService, KubernetesModule]
})
export class MetricsModule {}
