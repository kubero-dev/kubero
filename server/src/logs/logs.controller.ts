import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { OKDTO } from '../common/dto/ok.dto';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller({ path: 'api/logs', version: '1' })
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('/:pipeline/:phase/:app/:container/history')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('logs:ok')
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
    @Request() req: any,
  ) {
    return this.logsService.getLogsHistory(
      pipeline,
      phase,
      app,
      container,
      req.user.userGroups,
    );
  }

  @Get('/:pipeline/:phase/:app/')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('logs:ok')
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
    @Request() req: any,
  ) {
    return this.logsService.startLogging(
      pipeline,
      phase,
      app,
      req.user.userGroups,
    );
  }
}
