import { Controller, Get, Param } from '@nestjs/common';
import { RepoService } from './repo.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller({ path: 'api/repo', version: '1' })
export class RepoController {
  constructor(
    private readonly repoService: RepoService,
  ) {}

  @ApiOperation({ summary: 'Get a list of all available repository providers' })
  @Get('/providers')
  async listRepositories() {
    return this.repoService.listRepositories();
  }

  @ApiOperation({ summary: 'Get a list of all available repositories' })
  @Get('/:provider/repositories')
  async listRepositoriesByProvider(
    @Param('provider') provider: string,
  ) {
    return this.repoService.listRepositoriesByProvider(provider);
  }

  @ApiOperation({ summary: 'Get a list of available branches' })
  @Get('/:provider/:gitrepob64/branches')
  async listBranches(
    @Param('provider') provider: string,
    @Param('gitrepob64') gitrepob64: string,
  ) {
    return this.repoService.listBranches(provider, gitrepob64);
  }

  @ApiOperation({ summary: 'Get a list of available Pull requests' })
  @Get('/:provider/:gitrepob64/pullrequests')
  async listPullRequests(
    @Param('provider') provider: string,
    @Param('gitrepob64') gitrepob64: string,
  ) {
    return this.repoService.listPullrequests(provider, gitrepob64);
  }

  @ApiOperation({ summary: 'Get a list of all available references' })
  @Get('/:provider/:gitrepob64/references')
  async listReferences(
    @Param('provider') provider: string,
    @Param('gitrepob64') gitrepob64: string,
  ) {
    return this.repoService.listReferences(provider, gitrepob64);
  }
}
