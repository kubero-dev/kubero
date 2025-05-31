import { Module } from '@nestjs/common';
import { RepoController } from './repo.controller';
import { RepoService } from './repo.service';
import { AppsService } from 'src/apps/apps.service';

@Module({
  controllers: [RepoController],
  providers: [RepoService, AppsService],
})
export class RepoModule {}
