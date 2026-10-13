import { Global, Module } from '@nestjs/common';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { ConfigModule } from '../config/config.module';
import { PrismaClient } from '@prisma/client';
import { KubernetesModule } from 'src/kubernetes/kubernetes.module';

@Module({
  controllers: [RegistryController],
  providers: [RegistryService],
  exports: [RegistryService],
  imports: [ConfigModule, KubernetesModule, PrismaClient],
})
export class RegistryModule {}
