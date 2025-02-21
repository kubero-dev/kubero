import { Test, TestingModule } from '@nestjs/testing';
import { CoreService } from './core.service';

describe('CoreService', () => {
  let service: CoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreService],
    }).compile();

    service = module.get<CoreService>(CoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
