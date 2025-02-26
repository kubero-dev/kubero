import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SecurityService } from './security.service';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.guard';
import { OKDTO } from 'src/shared/dto/ok.dto';

@Controller({ path: 'api/security', version: '1' })
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Get(':pipeline/:phase/:app/scan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Trigger a scan for a specific app' })
  async triggerScan(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.securityService.startScan(pipeline, phase, app);
  }

  @Get(':pipeline/:phase/:app/scan/result')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get the scan result for a specific app' })
  async getScanResult(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Query('logdetails') logdetails: string,
  ) {
    return this.securityService.getScanResult(
      pipeline,
      phase,
      app,
      logdetails === 'true',
    );
  }
}
