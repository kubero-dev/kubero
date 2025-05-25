import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { StatusService } from './status.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrometheusModule.register(), ScheduleModule.forRoot()],
  providers: [
    StatusService,
    makeCounterProvider({
      name: 'kubero_pipelines_total',
      help: 'metric_help',
      labelNames: ['pipeline', 'phase', 'app', 'namespace', 'status'],
    }),
  ],
})
export class StatusModule {}
