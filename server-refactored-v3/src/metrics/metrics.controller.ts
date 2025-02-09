import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@Controller({ path: 'api/metrics', version: '1' })
export class MetricsController {
  constructor(
    private metricsService: MetricsService,
  ) {}

  @ApiOperation({ summary: 'Get metrics for a specific app' })
  @Get('/:pipeline/:phase/:app')
  async getMetrics(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.metricsService.getPodMetrics(pipeline, phase, app);
  }
}
