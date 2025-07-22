import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
