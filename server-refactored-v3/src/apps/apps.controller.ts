import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Logger, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppsService } from './apps.service';
import { IUser } from '../auth/auth.interface';
import { ApiOperation } from '@nestjs/swagger';

@Controller({ path: 'api/apps', version: '1' })
export class AppsController {
  constructor(
    private readonly appsService: AppsService,
  ) {}

  @ApiOperation({ summary: 'Get app informations from  a specific app' })
  @Get('/:pipeline/:phase/:app')
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
      apitoken: '1234567890'
    };
    return this.appsService.createApp(app, user);
  }

  @ApiOperation({ summary: 'Delete an app' })
  @Delete('/:pipeline/:phase/:app')
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
      apitoken: '1234567890'
    };
    return this.appsService.deleteApp(pipeline, phase, app, user);
  }

  @ApiOperation({ summary: 'Start a Pull Request App' })
  @Post('/pullrequest')
  async startPullRequest(
    @Body() body: any,
  ) {
    return this.appsService.createPRApp(
      body.branch,
      body.branch,
      body.ssh_url,
      body.pipelineName,
    );
  }

  @ApiOperation({ summary: 'Download the app templates' })
  @Get('/:pipeline/:phase/:app/download')
  async downloadAppTemplates(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.appsService.getTemplate(pipeline, phase, app);
  }

  @ApiOperation({ summary: 'Restart/Reload an app' })
  @Get('/:pipeline/:phase/:app/restart')
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
      apitoken: '1234567890'
    };

    return this.appsService.restartApp(pipeline, phase, app, user);
  }

}
