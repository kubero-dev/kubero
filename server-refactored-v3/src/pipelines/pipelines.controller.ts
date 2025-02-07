import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
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

  @ApiOperation({ summary: 'Get a pipeline' })
  @Get('/:pipeline')
  async getPipeline() {
    return 'Pipeline';
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
  async getPipelineApps() {
    return 'Pipeline apps';
  }
}
