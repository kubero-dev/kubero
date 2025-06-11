import { Injectable, Logger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';
import { Cron } from '@nestjs/schedule';
import { PipelinesService } from '../pipelines/pipelines.service';
import { AppsService } from '../apps/apps.service';

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);
  constructor(
    @InjectMetric('kubero_pipelines_total') public pipelineTotal: Gauge<string>,
    @InjectMetric('kubero_apps_total') public appsTotal: Gauge<string>,
    private pipelinesService: PipelinesService,
    private appsService: AppsService,
  ) {}

  @Cron('*/15 * * * * *')
  async updateKuberoMetrics(): Promise<void> {
    const pipelineTotal = await this.pipelinesService.countPipelines();
    this.pipelineTotal.set({}, pipelineTotal);

    const appTotal = await this.appsService.countApps();
    //this.appsTotal.inc({}, appTotal);
    this.appsTotal.set({}, appTotal);
  }

  async getPipelineCount(): Promise<number> {
    try {
      const count = await this.pipelinesService.countPipelines();
      return count || 0;
    } catch (error) {
      this.logger.error(`Error getting pipeline count: ${error.message}`);
      return 0;
    }
  }

  async getAppCount(): Promise<number> {
    try {
      const count = await this.appsService.countApps();
      return count || 0;
    } catch (error) {
      this.logger.error(`Error getting app count: ${error.message}`);
      return 0;
    }
  }
}
