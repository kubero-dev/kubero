import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Global()
@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
