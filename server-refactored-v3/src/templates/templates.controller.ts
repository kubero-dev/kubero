import { Controller, Get, Logger, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { Response } from 'express';

@Controller({ path: 'api/templates', version: '1' })
export class TemplatesController {
  private readonly logger = new Logger(TemplatesController.name);
  constructor(
    private readonly templatesService: TemplatesService,
  ) {}

  @ApiOperation({ summary: 'Load a specific template' })
  @Get('/:templateB64')
  @ApiParam({ name: "templateB64", type: "string", description: "A base64 encoded URL", required: true })
  async getTemplate(
    @Param('templateB64') templateB64: string,
    @Res() res: Response
  ) {
    try {
      const template = await this.templatesService.getTemplate(templateB64);
      res.send(template);
    } catch (err) {
      this.logger.error(err);
      res.status(500).send(err);
    }
  }
}
