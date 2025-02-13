import { Controller, Get, Param, Query } from '@nestjs/common';
import { SecurityService } from './security.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller({ path: 'api/security', version: '1' })
export class SecurityController {
  constructor(
    private securityService: SecurityService,
  ) {}

  @ApiOperation({ summary: 'Trigger a scan for a specific app' })
  @Get(':pipeline/:phase/:app/scan')
  async triggerScan(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.securityService.startScan(pipeline, phase, app);
  }

  @ApiOperation({ summary: 'Get the scan result for a specific app' })
  @Get(':pipeline/:phase/:app/scan/result')
  async getScanResult(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Query('logdetails') logdetails: string,
  ) {
    return this.securityService.getScanResult(pipeline, phase, app, logdetails === 'true');
  }

}
