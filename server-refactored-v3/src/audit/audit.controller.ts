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
import { ApiBearerAuth, ApiForbiddenResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OKDTO } from 'src/shared/dto/ok.dto';


@Controller({ path: 'api/audit', version: '1' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @ApiOperation({ summary: 'Get all audit entries for a specific app' })
  @Get('/:pipeline/:phase/:app')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
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
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
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
