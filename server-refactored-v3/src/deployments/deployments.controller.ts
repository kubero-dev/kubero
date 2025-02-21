import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { IUser } from 'src/auth/auth.interface';
import { CreateBuild } from './dto/CreateBuild.dto';
import { OKDTO } from 'src/shared/dto/ok.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller({ path: 'api/deployments', version: '1' })
export class DeploymentsController {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  @Get('/:pipeline/:phase/:app')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'List deployments for a specific app' })
  @ApiParam({ name: 'pipeline', description: 'Pipeline name' })
  @ApiParam({ name: 'phase', description: 'Phase name' })
  @ApiParam({ name: 'app', description: 'App name' })
  async getDeployments(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
  ) {
    return this.deploymentsService.listBuildjobs(pipeline, phase, app);
  }

  @Post('/build/:pipeline/:phase/:app')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Build a specific app' })
  @ApiParam({ name: 'pipeline', description: 'Pipeline name' })
  @ApiParam({ name: 'phase', description: 'Phase name' })
  @ApiParam({ name: 'app', description: 'App name' })
  @ApiBody({ type: CreateBuild, required: true, schema: { $ref: '#/components/schemas/CreateBuild' } })
  async buildApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Body() body: CreateBuild,
  ) {
    //TODO: Migration -> this is a mock user
    const user: IUser = {
      id: 1,
      method: 'local',
      username: 'admin',
      apitoken: '1234567890',
    };
    return this.deploymentsService.triggerBuildjob(pipeline, phase, app, body.buildstrategy, body.repository, body.reference, body.dockerfilePath, user);
  }

  @Delete('/:pipeline/:phase/:app/:buildName')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Delete a specific app' })
  @ApiParam({ name: 'pipeline', description: 'Pipeline name' })
  @ApiParam({ name: 'phase', description: 'Phase name' })
  @ApiParam({ name: 'app', description: 'App name' })
  @ApiParam({ name: 'buildName', description: 'Build name' })
  async deleteApp(
    @Param('pipeline') pipeline: string,
    @Param('phase') phase: string,
    @Param('app') app: string,
    @Param('buildName') buildName: string,
  ) {
    //TODO: Migration -> this is a mock user
    const user: IUser = {
      id: 1,
      method: 'local',
      username: 'admin',
      apitoken: '1234567890',
    };
    return this.deploymentsService.deleteBuildjob(pipeline, phase, app, buildName, user);
  }

  @Get('/:pipeline/:phase/:app/:build/:container/history')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get logs for a specific app' })
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
  ) {
    return this.deploymentsService.getBuildLogs(pipeline, phase, app, build, container);
  }
}
