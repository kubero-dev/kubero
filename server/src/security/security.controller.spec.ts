import { Test, TestingModule } from '@nestjs/testing';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';

describe('SecurityController', () => {
  let controller: SecurityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityController],
      providers: [
        {
          provide: SecurityService,
          useValue: {
            getSecuritySettings: jest.fn(),
            updateSecuritySettings: jest.fn(),
            getSecurityEvents: jest.fn(),
            getSecurityEventById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SecurityController>(SecurityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
