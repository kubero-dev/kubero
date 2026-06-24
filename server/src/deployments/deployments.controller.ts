import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { IUser } from '../auth/auth.interface';
import { CreateBuild } from './dto/CreateBuild.dto';
import { OKDTO } from '../common/dto/ok.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { ReadonlyGuard } from '../common/guards/readonly.guard';

@Controller({ path: 'api/deployments', version: '1' })
export class DeploymentsController {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  @Get('/:pipeline/:phase/:app')
  @UseGuards(JwtAuthGuard)
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'List deployments for a specific app' })
  @ApiParam({ name: 'pipeline', description: 'Pipeline name' })
  @ApiParam({ name: 'phase', description: 'Phase name' })
  @ApiParam({ name: 'app', description: 'App name' })
  async getDeployments(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Request() req: any,
  ) {
    return this.deploymentsService.listBuildjobs(
      pipeline,
      phase,
      app,
      req.user.userGroups,
    );
  }

  @Post('/build/:pipeline/:phase/:app')
  @UseGuards(JwtAuthGuard)
  @UseGuards(ReadonlyGuard)
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Build a specific app' })
  @ApiParam({ name: 'pipeline', description: 'Pipeline name' })
  @ApiParam({ name: 'phase', description: 'Phase name' })
  @ApiParam({ name: 'app', description: 'App name' })
  @ApiBody({
    type: CreateBuild,
    required: true,
    schema: { $ref: '#/components/schemas/CreateBuild' },
  })
  async buildApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Body() body: CreateBuild,
    @Request() req: any,
  ) {
    const user: IUser = {
      id: req.user.userId,
      strategy: req.user.strategy,
      username: req.user.username,
    };
    return this.deploymentsService.triggerBuildjob(
      pipeline,
      phase,
      app,
      body.buildstrategy,
      body.repository,
      body.reference,
      body.dockerfilePath,
      user,
    );
  }

  @Delete('/:pipeline/:phase/:app/:buildName')
  @UseGuards(JwtAuthGuard)
  @UseGuards(ReadonlyGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Delete a specific build' })
  @ApiParam({ name: 'pipeline', description: 'Pipeline name' })
  @ApiParam({ name: 'phase', description: 'Phase name' })
  @ApiParam({ name: 'app', description: 'App name' })
  @ApiParam({ name: 'buildName', description: 'Build name' })
  async deleteApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Param('buildName') buildName: string,
    @Request() req: any,
  ) {
    const user: IUser = {
      id: req.user.userId,
      strategy: req.user.strategy,
      username: req.user.username,
    };
    return this.deploymentsService.deleteBuildjob(
      pipeline,
      phase,
      app,
      buildName,
      user,
    );
  }

  @Get('/:pipeline/:phase/:app/:build/:container/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get logs for a specific build' })
  @ApiParam({ name: 'pipeline', description: 'Pipeline name' })
  @ApiParam({ name: 'phase', description: 'Phase name' })
  @ApiParam({ name: 'app', description: 'App name' })
  @ApiParam({ name: 'build', description: 'Build name' })
  @ApiParam({ name: 'container', description: 'Container name' })
  async getLogs(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Param('build') build: string,
    @Param('container') container: string,
    @Request() req: any,
  ) {
    return this.deploymentsService.getBuildLogs(
      pipeline,
      phase,
      app,
      build,
      container,
      req.user.userGroups,
    );
  }

  @Put('/:pipeline/:phase/:app/:tag')
  @UseGuards(JwtAuthGuard)
  @UseGuards(ReadonlyGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Deploy a specific tag for an app' })
  @ApiParam({ name: 'pipeline', description: 'Pipeline name' })
  @ApiParam({ name: 'phase', description: 'Phase name' })
  @ApiParam({ name: 'app', description: 'App name' })
  @ApiParam({ name: 'tag', description: 'Tag to deploy' })
  async deployTag(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Param('tag') tag: string,
    @Request() req: any,
  ): Promise<OKDTO> {
    this.deploymentsService.deployApp(
      pipeline,
      phase,
      app,
      tag,
      req.user.userGroups,
    );
    return {
      message: `Deployment triggered for ${app} in ${pipeline} phase ${phase} with tag ${tag}`,
      status: 'success',
    };
  }
}
