import { Module } from '@nestjs/common';
import { CoreService } from './core.service';

@Module({
  providers: [CoreService]
})
export class CoreModule {}
