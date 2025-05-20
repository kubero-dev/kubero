import { Test, TestingModule } from '@nestjs/testing';
import { LogsService } from './logs.service';

describe('LogsService', () => {
  let service: LogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LogsService,
          useValue: {
            getLogs: jest.fn(),
            getLogById: jest.fn(),
            createLog: jest.fn(),
            updateLog: jest.fn(),
            deleteLog: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LogsService>(LogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
