import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { OKDTO } from '../common/dto/ok.dto';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller({ path: 'api/security', version: '1' })
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Get(':pipeline/:phase/:app/scan')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('security:write')
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
    @Request() req: any,
  ) {
    return this.securityService.startScan(
      pipeline,
      phase,
      app,
      req.user.userGroups,
    );
  }

  @Get(':pipeline/:phase/:app/scan/result')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('security:write', 'security:read')
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
    @Request() req: any,
  ) {
    return this.securityService.getScanResult(
      pipeline,
      phase,
      app,
      logdetails === 'true',
      req.user.userGroups,
    );
  }
}
