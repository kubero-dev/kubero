import { Controller, Get, Param } from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller({ path: 'api/deployments', version: '1' })
export class DeploymentsController {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  @ApiOperation({ summary: 'List deployments for a specific app' })
  @Get('/:pipeline/:phase/:app')
  async getDeployments(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.deploymentsService.listBuildjobs(pipeline, phase, app);
  }
}
