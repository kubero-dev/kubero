import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';

describe('SettingsService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
            getBoolean: jest.fn(),
            getNumber: jest.fn(),
            getString: jest.fn(),
            getObject: jest.fn(),
            getArray: jest.fn(),
            validateConfig: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
