import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { AppsService } from './apps.service';

@Controller({ path: 'api/apps', version: '1' })
export class AppsController {
  constructor(
    private readonly appsService: AppsService,
  ) {}

  @Get('/:pipeline/:phase/:app')
  async getApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') appName: string,
  ) {
    return this.appsService.getApp(pipeline, phase, appName);
  }
}
