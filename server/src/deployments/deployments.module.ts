import { Module } from '@nestjs/common';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsService } from './deployments.service';
import { AppsModule } from '../apps/apps.module';
import { LogsModule } from '../logs/logs.module';
import { RegistryModule } from '../registry/registry.module';

@Module({
  controllers: [DeploymentsController],
  imports: [AppsModule, LogsModule, RegistryModule],
  providers: [DeploymentsService],
})
export class DeploymentsModule {}
