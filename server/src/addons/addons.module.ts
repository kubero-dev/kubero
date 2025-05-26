import { Module } from '@nestjs/common';
import { AddonsController } from './addons.controller';
import { AddonsService } from './addons.service';
@Module({
  controllers: [AddonsController],
  providers: [AddonsService],
})
export class AddonsModule {}
