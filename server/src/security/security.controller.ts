import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
    return this.securityService.startScan(pipeline, phase, app, req.user.userGroups);
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

  @Get(':pipeline/:phase/:app/ignores')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('security:write', 'security:read')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'List the ignored vulnerabilities of an app' })
  async getIgnores(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Request() req: any,
  ) {
    return this.securityService.getIgnores(
      pipeline,
      phase,
      app,
      req.user.userGroups,
    );
  }

  @Post(':pipeline/:phase/:app/ignores')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('security:write')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Ignore a vulnerability of an app, optionally until a date',
  })
  async addIgnore(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    try {
      return await this.securityService.addIgnore(
        pipeline,
        phase,
        app,
        body,
        req.user.userGroups,
      );
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':pipeline/:phase/:app/ignores/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('security:write')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Stop ignoring a vulnerability of an app' })
  async removeIgnore(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Param('id') id: string,
    @Query('pkg') pkg: string,
    @Request() req: any,
  ) {
    try {
      return await this.securityService.removeIgnore(
        pipeline,
        phase,
        app,
        id,
        pkg,
        req.user.userGroups,
      );
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
