import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { AppsService } from 'src/apps/apps.service';
import { LogsController } from './logs.controller';

@Module({
  providers: [LogsService, AppsService],
  controllers: [LogsController],
})
export class LogsModule {}
