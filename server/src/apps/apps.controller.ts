import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AppsService } from './apps.service';
import { IUser } from '../auth/auth.interface';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetAppDTO } from './apps.dto';
import { OKDTO } from '../common/dto/ok.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { ReadonlyGuard } from '../common/guards/readonly.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller({ path: 'api/apps', version: '1' })
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get('/:pipeline/:phase/:app')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('app:read', 'app:write')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Get app informations from  a specific app',
    description: 'Returns the app information from a specific app',
  })
  @ApiOkResponse({
    description: 'A List of App Informations',
    type: GetAppDTO,
    isArray: false,
  })
  async getApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Request() req: any,
  ) {
    return this.appsService.getApp(pipeline, phase, app, req.user.userGroups);
  }

  @Post('/:pipeline/:phase/:app')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('app:write')
  @UseGuards(ReadonlyGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an app' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBearerAuth('bearerAuth')
  async createApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') appName: string,
    @Body() app: any,
    @Request() req: any,
  ) {
    if (appName !== 'new') {
      const msg = 'App name does not match the URL';
      Logger.error(msg);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
    if (app.pipeline !== pipeline) {
      const msg = 'Pipeline name does not match the URL';
      Logger.error(msg);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
    if (app.phase !== phase) {
      const msg = 'Phase name does not match the URL';
      Logger.error(msg);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }

    const user: IUser = {
      id: req.user.userId,
      strategy: req.user.strategy,
      username: req.user.username,
    };
    return this.appsService.createApp(app, user, req.user.userGroups);
  }

  @Put('/:pipeline/:phase/:app/:resourceVersion')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('app:write')
  @UseGuards(ReadonlyGuard)
  @ApiOperation({ summary: 'Update an app' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBearerAuth('bearerAuth')
  async updateApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') appName: string,
    @Param('resourceVersion') resourceVersion: string,
    @Body() app: any,
    @Request() req: any,
  ) {
    if (appName !== app.name) {
      const msg =
        'App name does not match the URL ' + appName + ' != ' + app.name;
      Logger.error(msg);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }

    const user: IUser = {
      id: req.user.userId,
      strategy: req.user.strategy,
      username: req.user.username,
    };
    return this.appsService.updateApp(
      app,
      resourceVersion,
      user,
      req.user.userGroups,
    );
  }

  @Delete('/:pipeline/:phase/:app')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('app:write')
  @UseGuards(ReadonlyGuard)
  @ApiOperation({ summary: 'Delete an app' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBearerAuth('bearerAuth')
  async deleteApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Request() req: any,
  ) {
    const user: IUser = {
      id: req.user.userId,
      strategy: req.user.strategy,
      username: req.user.username,
    };
    return this.appsService.deleteApp(
      pipeline,
      phase,
      app,
      user,
      req.user.userGroups,
    );
  }

  @Post('/pullrequest')
  @UseGuards(JwtAuthGuard)
  @UseGuards(ReadonlyGuard)
  @ApiOperation({ summary: 'Start a Pull Request App' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBearerAuth('bearerAuth')
  async startPullRequest(@Body() body: any, @Request() req: any) {
    return this.appsService.createPRApp(
      body.branch,
      body.branch,
      body.ssh_url,
      body.pipelineName,
      req.user.userGroups,
    );
  }

  @Get('/:pipeline/:phase/:app/download')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('app:read', 'app:write')
  @ApiOperation({ summary: 'Download the app templates' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBearerAuth('bearerAuth')
  async downloadAppTemplates(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Request() req: any,
  ) {
    return this.appsService.getTemplate(
      pipeline,
      phase,
      app,
      req.user.userGroups,
    );
  }

  @Get('/:pipeline/:phase/:app/restart')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('app:write')
  @UseGuards(ReadonlyGuard)
  @ApiOperation({ summary: 'Restart/Reload an app' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBearerAuth('bearerAuth')
  async restartApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Request() req: any,
  ) {
    const user: IUser = {
      id: req.user.userId,
      strategy: req.user.strategy,
      username: req.user.username,
    };

    return this.appsService.restartApp(
      pipeline,
      phase,
      app,
      user,
      req.user.userGroups,
    );
  }

  @Get('/:pipeline/:phase/:app/pods')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('app:read', 'app:write')
  @ApiOperation({ summary: 'Get the app pods' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBearerAuth('bearerAuth')
  async getPods(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Request() req: any,
  ) {
    return this.appsService.getPods(pipeline, phase, app, req.user.userGroups);
  }

  @Post('/:pipeline/:phase/:app/console')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('app:write')
  @UseGuards(ReadonlyGuard)
  @ApiOperation({ summary: 'Start a container console' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBearerAuth('bearerAuth')
  async execInContainer(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    if (process.env.KUBERO_CONSOLE_ENABLED !== 'true') {
      const msg = 'Console is not enabled';
      Logger.warn(msg);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
    if (!body.podName || !body.containerName || !body.command) {
      const msg = 'Missing required fields: podName, containerName, command';
      Logger.error(msg);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
    /*
    if (!Array.isArray(body.command)) {
      const msg = 'Command must be an array';
      Logger.error(msg, body.command);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
    */
    if (body.command.length === 0) {
      const msg = 'Command array cannot be empty';
      Logger.error(msg);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }

    const user: IUser = {
      id: req.user.userId,
      strategy: req.user.strategy,
      username: req.user.username,
    };

    const podName = body.podName;
    const containerName = body.containerName;
    const command = body.command;

    return this.appsService.execInContainer(
      pipeline,
      phase,
      app,
      podName,
      containerName,
      command,
      user,
      req.user.userGroups,
    );
  }
}
