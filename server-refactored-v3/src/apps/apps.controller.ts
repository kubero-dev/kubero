import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { AppsService } from './apps.service';
import { IUser } from '../auth/auth.interface';
import { ApiOperation } from '@nestjs/swagger';

@Controller({ path: 'api/apps', version: '1' })
export class AppsController {
  constructor(
    private readonly appsService: AppsService,
  ) {}

  @Get('/:pipeline/:phase/:app')
  async getApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.appsService.getApp(pipeline, phase, app);
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async createApp(
    @Body() app: any,
  ) {
    //TODO: Migration -> this is a mock user
    const user: IUser = {
      id: 1,
      method: 'local',
      username: 'admin',
      apitoken: '1234567890'
    };
    return this.appsService.createApp(app, user);
  }

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

}
