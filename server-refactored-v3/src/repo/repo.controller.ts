import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RepoService } from './repo.service';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OKDTO } from 'src/shared/dto/ok.dto';

@Controller({ path: 'api/repo', version: '1' })
export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  @Get('/providers')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get a list of all available repository providers' })
  async listRepositories() {
    return this.repoService.listRepositories();
  }

  @Get('/:provider/repositories')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get a list of all available repositories' })
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  async listRepositoriesByProvider(@Param('provider') provider: string) {
    return this.repoService.listRepositoriesByProvider(provider);
  }

  @Get('/:provider/:gitrepob64/branches')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get a list of available branches' })
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  @ApiParam({ name: "gitrepob64", type: "string", description: "A base64 encoded repository URL", required: true })
  async listBranches(
    @Param('provider') provider: string,
    @Param('gitrepob64') gitrepob64: string,
  ) {
    return this.repoService.listBranches(provider, gitrepob64);
  }

  @Get('/:provider/:gitrepob64/pullrequests')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get a list of available Pull requests' })
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  @ApiParam({ name: "gitrepob64", type: "string", description: "A base64 encoded repository URL", required: true })
  async listPullRequests(
    @Param('provider') provider: string,
    @Param('gitrepob64') gitrepob64: string,
  ) {
    return this.repoService.listPullrequests(provider, gitrepob64);
  }

  @Get('/:provider/:gitrepob64/references')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get a list of all available references' })
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  @ApiParam({ name: "gitrepob64", type: "string", description: "A base64 encoded repository URL", required: true })
  async listReferences(
    @Param('provider') provider: string,
    @Param('gitrepob64') gitrepob64: string,
  ) {
    return this.repoService.listReferences(provider, gitrepob64);
  }

  @Post('/:provider/connect')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Connect a repository' })
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  async connectRepo(@Param('provider') provider: string, @Body() body: any) {
    return this.repoService.connectRepo(provider, body.gitrepo);
  }

  @Post('/:provider/disconnect')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Disconnect a repository' })
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  async disconnectRepo(@Param('provider') provider: string, @Body() body: any) {
    return this.repoService.disconnectRepo(provider, body.gitrepo);
  }

  @Post('/repo/webhooks/:provider')
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Webhooks endpoint for repository providers' })
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  async repositoryWebhook(@Body() body: any) {
    return 'Not implemented';
  }
}
