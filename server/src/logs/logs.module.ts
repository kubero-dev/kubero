import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { AppsModule } from '../apps/apps.module';

@Module({
  providers: [LogsService],
  controllers: [LogsController],
  imports: [AppsModule],
  exports: [LogsService]
})
export class LogsModule {}
