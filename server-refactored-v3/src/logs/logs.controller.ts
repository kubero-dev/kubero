import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { LogsService } from './logs.service';

@Controller({ path: 'api/logs', version: '1' })
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @ApiOperation({ summary: 'Get the logs for a specific container' })
  @Get('/:pipeline/:phase/:app/:container/history')
  async getLogs(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Param('container') container: string,
  ) {
    return this.logsService.getLogsHistory(pipeline, phase, app, container);
  }

  @ApiOperation({ summary: 'Get the logs for a specific container' })
  @Get('/:pipeline/:phase/:app/')
  async getLogsForApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.logsService.startLogging(pipeline, phase, app);
  }
}
