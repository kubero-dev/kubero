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
}
