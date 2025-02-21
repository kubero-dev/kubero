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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AppsService } from './apps.service';
import { IUser } from '../auth/auth.interface';
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetAppDTO  } from './apps.dto';
import { OKDTO } from 'src/shared/dto/ok.dto';

@Controller({ path: 'api/apps', version: '1' })
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get('/:pipeline/:phase/:app')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ 
    summary: 'Get app informations from  a specific app' ,
    description: 'Returns the app information from a specific app'
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
  ) {
    return this.appsService.getApp(pipeline, phase, app);
  }

  @ApiOperation({ summary: 'Create an app' })
  @Post('/:pipeline/:phase/:app')
  @HttpCode(HttpStatus.CREATED)
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  async createApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') appName: string,
    @Body() app: any,
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

    //TODO: Migration -> this is a mock user
    const user: IUser = {
      id: 1,
      method: 'local',
      username: 'admin',
      apitoken: '1234567890',
    };
    return this.appsService.createApp(app, user);
  }

  @ApiOperation({ summary: 'Update an app' })
  @Put('/:pipeline/:phase/:app/:resourceVersion')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  async updateApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') appName: string,
    @Param('resourceVersion') resourceVersion: string,
    @Body() app: any,
  ) {
    if (appName !== app.name) {
      const msg =
        'App name does not match the URL ' + appName + ' != ' + app.name;
      Logger.error(msg);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }

    //TODO: Migration -> this is a mock user
    const user: IUser = {
      id: 1,
      method: 'local',
      username: 'admin',
      apitoken: '1234567890',
    };
    return this.appsService.updateApp(app, resourceVersion, user);
  }

  @ApiOperation({ summary: 'Delete an app' })
  @Delete('/:pipeline/:phase/:app')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  async deleteApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    //TODO: Migration -> this is a mock user
    const user: IUser = {
      id: 1,
      method: 'local',
      username: 'admin',
      apitoken: '1234567890',
    };
    return this.appsService.deleteApp(pipeline, phase, app, user);
  }

  @ApiOperation({ summary: 'Start a Pull Request App' })
  @Post('/pullrequest')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  async startPullRequest(@Body() body: any) {
    return this.appsService.createPRApp(
      body.branch,
      body.branch,
      body.ssh_url,
      body.pipelineName,
    );
  }

  @ApiOperation({ summary: 'Download the app templates' })
  @Get('/:pipeline/:phase/:app/download')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  async downloadAppTemplates(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.appsService.getTemplate(pipeline, phase, app);
  }

  @ApiOperation({ summary: 'Restart/Reload an app' })
  @Get('/:pipeline/:phase/:app/restart')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  async restartApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    //TODO: Migration -> this is a mock user
    const user: IUser = {
      id: 1,
      method: 'local',
      username: 'admin',
      apitoken: '1234567890',
    };

    return this.appsService.restartApp(pipeline, phase, app, user);
  }

  @ApiOperation({ summary: 'Get the app pods' })
  @Get('/:pipeline/:phase/:app/pods')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  async getPods(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.appsService.getPods(pipeline, phase, app);
  }

  @ApiOperation({ summary: 'Start a container console' })
  @Post('/:pipeline/:phase/:app/console')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  async execInContainer(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Body() body: any,
  ) {

    const user: IUser = {
      id: 1,
      method: 'local',
      username: 'admin',
      apitoken: '1234567890',
    };

    const podName = body.podName;
    const containerName = body.containerName;
    const command = body.command;

    return this.appsService.execInContainer(pipeline, phase, app, podName, containerName, command, user);
  }
}
