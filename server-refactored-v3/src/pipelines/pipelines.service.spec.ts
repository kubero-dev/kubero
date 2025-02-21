import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesService } from './pipelines.service';

describe('PipelinesService', () => {
  let service: PipelinesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipelinesService],
    }).compile();

    service = module.get<PipelinesService>(PipelinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
