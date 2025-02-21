import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { AuthGuard } from '@nestjs/passport';
import { OKDTO } from 'src/shared/dto/ok.dto';

@Controller({ path: 'api/logs', version: '1' })
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('/:pipeline/:phase/:app/:container/history')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get the logs for a specific container' })
  @ApiParam({ name: 'pipeline', description: 'Pipeline name' })
  @ApiParam({ name: 'phase', description: 'Phase name' })
  @ApiParam({ name: 'app', description: 'App name' })
  @ApiParam({ name: 'container', description: 'Container name' })
  async getLogs(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Param('container') container: string,
  ) {
    return this.logsService.getLogsHistory(pipeline, phase, app, container);
  }

  @Get('/:pipeline/:phase/:app/')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get the logs for a specific container' })
  @ApiParam({ name: 'pipeline', description: 'Pipeline name' })
  @ApiParam({ name: 'phase', description: 'Phase name' })
  @ApiParam({ name: 'app', description: 'App name' })
  async getLogsForApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.logsService.startLogging(pipeline, phase, app);
  }
}
