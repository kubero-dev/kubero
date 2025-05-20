import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesService } from './pipelines.service';

describe('PipelinesService', () => {
  let service: PipelinesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PipelinesService,
          useValue: {
            getPipelines: jest.fn(),
            getPipelineById: jest.fn(),
            createPipeline: jest.fn(),
            updatePipeline: jest.fn(),
            deletePipeline: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PipelinesService>(PipelinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
