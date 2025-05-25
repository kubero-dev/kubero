import { Injectable, Logger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';
import { Cron } from '@nestjs/schedule';
import { PipelinesService } from '../pipelines/pipelines.service';

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);
  constructor(
    @InjectMetric('kubero_pipelines_total') public counter: Gauge<string>,
    private pipelinesService: PipelinesService,
  ) {}

  @Cron('*/15 * * * * *')
  async updatePipelineCount(): Promise<void> {
    const pipelineCount = 0;
    const count = await this.pipelinesService
      .countPipelines()
      .catch((error) => {
        this.logger.error(`Error counting pipelines: ${error.message}`);
      });

    if (count) {
      this.counter.inc({}, count);
    } else {
      this.logger.warn('No pipelines found or error occurred while counting.');
    }
  }
}
