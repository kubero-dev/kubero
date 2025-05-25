import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { StatusService } from './status.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AppsService } from '../apps/apps.service';

@Module({
  imports: [PrometheusModule.register(), ScheduleModule.forRoot()],
  providers: [
    StatusService,
    AppsService,
    makeCounterProvider({
      name: 'kubero_pipelines_total',
      help: 'Total number of pipelines',
      labelNames: ['pipeline', 'phase', 'app', 'namespace', 'status'],
    }),
    makeCounterProvider({
      name: 'kubero_apps_total',
      help: 'Total number of apps',
      labelNames: ['pipeline', 'phase', 'app', 'namespace', 'status'],
    }),
  ],
})
export class StatusModule {}
