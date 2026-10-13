import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CreatePipelineDTO } from './dto/replacePipeline.dto';
import { GetPipelineDTO } from './dto/getPipeline.dto';
import { OKDTO } from '../common/dto/ok.dto';
import { IUser } from '../auth/auth.interface';
import { IPipeline } from './pipelines.interface';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { ReadonlyGuard } from '../common/guards/readonly.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller({ path: 'api/pipelines', version: '1' })
export class PipelinesController {
  constructor(private pipelinesService: PipelinesService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pipeline:read', 'pipeline:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'A List of Pipelines',
    type: GetPipelineDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get all pipelines' })
  async getPipelines(@Request() req: any) {
    return this.pipelinesService.listPipelines(req.user.userGroups);
  }

  @Post('/:pipeline')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pipeline:write')
  @UseGuards(ReadonlyGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'A List of Pipelines',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Create a new pipeline' })
  async createPipeline(
    @Param('pipeline') pipelineName: string,
    @Body() pl: CreatePipelineDTO,
    @Request() req: any,
  ): Promise<OKDTO> {
    if (pipelineName !== 'new') {
      const msg = 'Pipeline name does not match the URL';
      Logger.error(msg);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
    const user: IUser = {
      id: req.user.userId,
      strategy: req.user.strategy,
      username: req.user.username,
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
      access: pl.access,
    };
    return this.pipelinesService.createPipeline(
      pipeline,
      user,
    ) as Promise<OKDTO>;
  }

  @Get('/:pipeline')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pipeline:read', 'pipeline:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get a specific pipeline' })
  async getPipeline(@Param('pipeline') pipeline: string) {
    return this.pipelinesService.getPipeline(pipeline);
  }

  @Put('/:pipeline')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pipeline:write')
  @UseGuards(ReadonlyGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Update a pipeline' })
  async updatePipeline(
    @Body() pl: CreatePipelineDTO,
    @Request() req: any,
    @Param('pipeline') pipelineName: string,
  ) {
    const user: IUser = {
      id: req.user.userId,
      strategy: req.user.strategy,
      username: req.user.username,
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
      access: pl.access,
    };
    return this.pipelinesService.updatePipeline(
      pipeline,
      pl.resourceVersion as string,
      user,
    );
  }

  @Delete('/:pipeline')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pipeline:write')
  @UseGuards(ReadonlyGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Delete a pipeline' })
  async deletePipeline(
    @Param('pipeline') pipeline: string,
    @Request() req: any,
  ): Promise<OKDTO> {
    const user: IUser = {
      id: req.user.userId,
      strategy: req.user.strategy,
      username: req.user.username,
    };
    await this.pipelinesService.deletePipeline(pipeline, user);
    return { status: 'ok', message: '' } as OKDTO;
  }

  @Get('/:pipeline/apps')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pipeline:read', 'pipeline:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get all apps for a pipeline' })
  async getPipelineApps(
    @Param('pipeline') pipeline: string,
    @Request() req: any,
  ) {
    return this.pipelinesService.getPipelineWithApps(
      pipeline,
      req.user.userGroups,
    );
  }
}
