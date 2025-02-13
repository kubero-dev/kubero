import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RepoService } from './repo.service';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller({ path: 'api/repo', version: '1' })
export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  @ApiOperation({ summary: 'Get a list of all available repository providers' })
  @Get('/providers')
  async listRepositories() {
    return this.repoService.listRepositories();
  }

  @ApiOperation({ summary: 'Get a list of all available repositories' })
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  @Get('/:provider/repositories')
  async listRepositoriesByProvider(@Param('provider') provider: string) {
    return this.repoService.listRepositoriesByProvider(provider);
  }

  @ApiOperation({ summary: 'Get a list of available branches' })
  @Get('/:provider/:gitrepob64/branches')
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  @ApiParam({ name: "gitrepob64", type: "string", description: "A base64 encoded repository URL", required: true })
  async listBranches(
    @Param('provider') provider: string,
    @Param('gitrepob64') gitrepob64: string,
  ) {
    return this.repoService.listBranches(provider, gitrepob64);
  }

  @ApiOperation({ summary: 'Get a list of available Pull requests' })
  @Get('/:provider/:gitrepob64/pullrequests')
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  @ApiParam({ name: "gitrepob64", type: "string", description: "A base64 encoded repository URL", required: true })
  async listPullRequests(
    @Param('provider') provider: string,
    @Param('gitrepob64') gitrepob64: string,
  ) {
    return this.repoService.listPullrequests(provider, gitrepob64);
  }

  @ApiOperation({ summary: 'Get a list of all available references' })
  @Get('/:provider/:gitrepob64/references')
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  @ApiParam({ name: "gitrepob64", type: "string", description: "A base64 encoded repository URL", required: true })
  async listReferences(
    @Param('provider') provider: string,
    @Param('gitrepob64') gitrepob64: string,
  ) {
    return this.repoService.listReferences(provider, gitrepob64);
  }

  @ApiOperation({ summary: 'Connect a repository' })
  @Post('/:provider/connect')
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  async connectRepo(@Param('provider') provider: string, @Body() body: any) {
    return this.repoService.connectRepo(provider, body.gitrepo);
  }

  @ApiOperation({ summary: 'Disconnect a repository' })
  @Post('/:provider/disconnect')
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  async disconnectRepo(@Param('provider') provider: string, @Body() body: any) {
    return this.repoService.disconnectRepo(provider, body.gitrepo);
  }

  @ApiOperation({ summary: 'Webhooks endpoint for repository providers' })
  @Post('/repo/webhooks/:provider')
  @ApiParam({ name: "provider", type: "string", description: "A git provider", required: true, enum: ['github', 'gitlab', 'bigbucket', 'gitea', 'gogs'] })
  async repositoryWebhook(@Body() body: any) {
    return 'Not implemented';
  }
}
