import { Module } from '@nestjs/common';
import { RepoController } from './repo.controller';
import { RepoService } from './repo.service';
import { AppsModule } from '../apps/apps.module';

@Module({
  controllers: [RepoController],
  providers: [RepoService],
  imports: [AppsModule],
})
export class RepoModule {}
