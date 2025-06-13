import { Controller, Get, Logger, Param, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { OKDTO } from '../common/dto/ok.dto';

@Controller({ path: 'api/templates', version: '1' })
export class TemplatesController {
  private readonly logger = new Logger(TemplatesController.name);
  constructor(private readonly templatesService: TemplatesService) {}

  @Get('/:templateB64')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Load a specific template' })
  @ApiParam({
    name: 'templateB64',
    type: 'string',
    description: 'A base64 encoded URL',
    required: true,
  })
  async getTemplate(
    @Param('templateB64') templateB64: string,
    @Res() res: Response,
  ) {
    try {
      const template = await this.templatesService.getTemplate(templateB64);
      res.send(template);
    } catch (err) {
      this.logger.error(err);
      res.status(500).send({
        error: 'Failed to load template',
        message: err.message || 'An unexpected error occurred',
      });
    }
  }
}
