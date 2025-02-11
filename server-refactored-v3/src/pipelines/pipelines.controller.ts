import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePipelineDTO } from './dto/replacePipeline.dto';
import { IUser } from '../auth/auth.interface';
import { IPipeline } from './pipelines.interface';

@Controller({ path: 'api/pipelines', version: '1' })
export class PipelinesController {

  constructor(private pipelinesService: PipelinesService) {}

  @ApiOperation({ summary: 'Get all pipelines' })
  @Get('/')
  async getPipelines() {
    return this.pipelinesService.listPipelines();
  }

  @ApiOperation({ summary: 'Create a new pipeline' })
  @Post('/')
  async createPipeline(@Body() pl: CreatePipelineDTO) {
    //TODO: Migration -> this is a mock user
    const user: IUser = {
      id: 1,
      method: 'local',
      username: 'admin',
      apitoken: '1234567890'
    };
    
    const pipeline: IPipeline = {
        name: pl.pipelineName,
        domain: pl.domain,
        phases: pl.phases,
        buildpack: pl.buildpack,
        reviewapps: pl.reviewapps,
        dockerimage: pl.dockerimage,
        git: pl.git,
        registry: pl.registry as any,
        deploymentstrategy: pl.deploymentstrategy,
        buildstrategy: pl.buildstrategy,
    };
    return this.pipelinesService.createPipeline(pipeline, user);
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
  async updatePipeline(@Body() pl: CreatePipelineDTO) {
    
    //TODO: Migration -> this is a mock user
    const user: IUser = {
      id: 1,
      method: 'local',
      username: 'admin',
      apitoken: '1234567890'
    };
    
    const pipeline: IPipeline = {
        name: pl.pipelineName,
        domain: pl.domain,
        phases: pl.phases,
        buildpack: pl.buildpack,
        reviewapps: pl.reviewapps,
        dockerimage: pl.dockerimage,
        git: pl.git,
        registry: pl.registry as any,
        deploymentstrategy: pl.deploymentstrategy,
        buildstrategy: pl.buildstrategy,
    };
    return this.pipelinesService.updatePipeline(pipeline, pl.resourceVersion as string, user);
  }

  @ApiOperation({ summary: 'Delete a pipeline' })
  @Delete('/:pipeline')
  async deletePipeline(
    @Param('pipeline') pipeline: string,
  ) {
    const user: IUser = {
      id: 1,
      method: 'local',
      username: 'admin',
      apitoken: '1234567890'
    };
    return this.pipelinesService.deletePipeline(pipeline, user);
  }

  @ApiOperation({ summary: 'Get all apps for a pipeline' })
  @Get('/:pipeline/apps')
  async getPipelineApps(
    @Param('pipeline') pipeline: string,
  ) {
    return this.pipelinesService.getPipelineWithApps(pipeline);
  }
}
