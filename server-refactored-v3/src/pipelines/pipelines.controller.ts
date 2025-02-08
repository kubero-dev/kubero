import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller({ path: 'api/pipelines', version: '1' })
export class PipelinesController {

  constructor(private pipelinesService: PipelinesService) {}

  @ApiOperation({ summary: 'Get all pipelines' })
  @Get('/')
  async getPipelines() {
    return this.pipelinesService.listPipelines();
  }

  @ApiOperation({ summary: 'Create a new pipeline' })
  @Post('/:pipeline')
  async createPipeline() {
    return 'Pipeline updated';
  }

  @ApiOperation({ summary: 'Get a soecific pipeline' })
  @Get('/:pipeline')
  async getPipeline(
    @Param('pipeline') pipeline: string,
  ) {
    return this.pipelinesService.getPipeline(pipeline);
  }

  @ApiOperation({ summary: 'Update a pipeline' })
  @Put('/:pipeline')
  async updatePipeline() {
    return 'Pipeline updated';
  }

  @ApiOperation({ summary: 'Delete a pipeline' })
  @Delete('/:pipeline')
  async deletePipeline() {
    return 'Pipeline deleted';
  }

  @ApiOperation({ summary: 'Get all apps for a pipeline' })
  @Get('/:pipeline/apps')
  async getPipelineApps(
    @Param('pipeline') pipeline: string,
  ) {
    return this.pipelinesService.getPipelineWithApps(pipeline);
  }
}
