import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  //makeCounterProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { StatusService } from './status.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AppsService } from '../apps/apps.service';
import { StatusController } from './status.controller';

@Module({
  imports: [
    PrometheusModule.register({
      controller: StatusController,
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    StatusService,
    AppsService,
    makeGaugeProvider({
      name: 'kubero_pipelines_total',
      help: 'Total number of pipelines',
      labelNames: ['pipeline', 'phase', 'app', 'namespace', 'status'],
    }),
    makeGaugeProvider({
      name: 'kubero_apps_total',
      help: 'Total number of apps',
      labelNames: ['pipeline', 'phase', 'app', 'namespace', 'status'],
    }),
  ],
})
export class StatusModule {}
