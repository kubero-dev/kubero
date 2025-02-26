import { Global, Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { KubernetesModule } from '../kubernetes/kubernetes.module';

@Global()
@Module({
  controllers: [ConfigController],
  providers: [ConfigService, KubernetesModule],
  exports: [ConfigService],
})
export class ConfigModule {}
