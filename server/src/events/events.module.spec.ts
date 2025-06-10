import { Test, TestingModule } from '@nestjs/testing';
import { EventsModule } from './events.module';
import { EventsGateway } from './events.gateway';

describe('EventsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [EventsModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide EventsGateway', () => {
    const gateway = module.get<EventsGateway>(EventsGateway);
    expect(gateway).toBeDefined();
  });
});
