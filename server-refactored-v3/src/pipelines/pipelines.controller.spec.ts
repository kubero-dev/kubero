import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';

describe('PipelinesController', () => {
  let controller: PipelinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipelinesController],
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

    controller = module.get<PipelinesController>(PipelinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
