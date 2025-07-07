import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { OKDTO } from '../common/dto/ok.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller({ path: 'api/audit', version: '1' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @ApiOperation({ summary: 'Get all audit entries for a specific app' })
  @Get('/app/:pipeline/:phase/:app')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('audit:read', 'audit:write')
  @ApiBearerAuth('bearerAuth')
  async getAudit(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Query(
      'limit',
      new DefaultValuePipe('100'),
      new ParseIntPipe({ optional: true }),
    )
    limit: number,
  ) {
    return this.auditService.getAppEntries(pipeline, phase, app, limit);
  }

  @ApiOperation({ summary: 'Get all audit entries' })
  @Get('/')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('audit:read', 'audit:write')
  @ApiBearerAuth('bearerAuth')
  async getAuditAll(
    @Query(
      'limit',
      new DefaultValuePipe('100'),
      new ParseIntPipe({ optional: true }),
    )
    limit: number,
  ) {
    return this.auditService.get(limit);
  }
}
