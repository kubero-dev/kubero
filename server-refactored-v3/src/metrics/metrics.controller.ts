import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@Controller({ path: 'api/metrics', version: '1' })
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @ApiOperation({ summary: 'Get metrics for a specific app' })
  @ApiParam({ name: 'pipeline', type: 'string' })
  @ApiParam({ name: 'phase', type: 'string' })
  @ApiParam({ name: 'app', type: 'string' })
  @Get('/resources/:pipeline/:phase/:app')
  async getMetrics(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.metricsService.getPodMetrics(pipeline, phase, app);
  }

  @ApiOperation({ summary: 'Get uptimes for pods on a Namespace' })
  @ApiParam({ name: 'pipeline', type: 'string' })
  @ApiParam({ name: 'phase', type: 'string' })
  @Get('/uptimes/:pipeline/:phase')
  async getUptimes(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
  ) {
    return this.metricsService.getUptimes(pipeline, phase);
  }

  @ApiOperation({ summary: 'Get timeseries' })
  @Get('/timeseries')
  async getWideMetricsList(
  ) {
    return this.metricsService.getLongTermMetrics('up');
  }

  @ApiOperation({ summary: 'Get timeseries to draw metrics' })
  @ApiParam({ name: 'type', enum: ['memory', 'load', 'httpstatuscodes', 'responsetime', 'traffic', 'cpu'] })
  @ApiParam({ name: 'pipeline', type: 'string' })
  @ApiParam({ name: 'phase', type: 'string' })
  @ApiParam({ name: 'app', type: 'string' })
  @ApiParam({ name: 'scale', enum: ['24h', '2h', '7d'], required: false })
  @ApiParam({ name: 'calc', enum: ['rate', 'increase'], required: false })
  @ApiParam({ name: 'host', type: 'string', required: false })
  @Get('/timeseries/:type/:pipeline/:phase/:app')
  async getWideMetrics(
    @Param('type') type: "memory" | "load" | "httpstatuscodes" | "responsetime" | "traffic" | "cpu",
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Query('scale') scale: "24h" | "2h" | "7d",
    @Query('calc') calc: "rate" | "increase" | undefined,
    @Query('host') host: string,
  ) {
    let ret: any;

    switch (type) {
      case 'memory':
        ret = this.metricsService.getMemoryMetrics({
          scale: scale || '24h',
          pipeline: pipeline,
          phase: phase,
          app: app
        });
        break;
      case 'load':
        ret = this.metricsService.getLoadMetrics({
          scale: scale || '24h',
          pipeline: pipeline,
          phase: phase,
          app: app
        });
        break;
      case 'httpstatuscodes':
        ret = this.metricsService.getHttpStatusCodesMetrics({
          scale: scale || '24h',
          pipeline: pipeline,
          phase: phase,
          host: host,
          calc: calc
        });
        break;
      case 'responsetime':
        ret = this.metricsService.getHttpResponseTimeMetrics({
          scale: scale || '24h',
          pipeline: pipeline,
          phase: phase,
          host: host,
          calc: calc
        });
        break;
      case 'traffic':
        ret = this.metricsService.getHttpResponseTrafficMetrics({
          scale: scale || '24h',
          pipeline: pipeline,
          phase: phase,
          host: host,
          calc: calc
        });
        break;
      case 'cpu':
        ret = this.metricsService.getCPUMetrics({
          scale: scale || '24h',
          pipeline: pipeline,
          phase: phase,
          app: app,
          calc: calc
        });
        break;
      default:
        ret = 'Invalid type';
        break;
    }
    return ret;
  }

  @ApiOperation({ summary: 'Get alerts Rules and status' })
  @ApiParam({ name: 'pipeline', type: 'string' })
  @ApiParam({ name: 'phase', type: 'string' })
  @ApiParam({ name: 'app', type: 'string' })
  @Get('/rules/:pipeline/:phase/:app')
  async getRules(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.metricsService.getRules({
      pipeline: pipeline,
      phase: phase,
      app: app
    });
  }

}
