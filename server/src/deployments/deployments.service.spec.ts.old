import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsService } from './deployments.service';

describe('DeploymentsService', () => {
  let service: DeploymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeploymentsController],
      providers: [{ provide: DeploymentsService, useValue: {} }],
    }).compile();

    service = module.get<DeploymentsService>(DeploymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
