import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentsService } from './deployments.service';

describe('DeploymentsService', () => {
  let service: DeploymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeploymentsService],
    }).compile();

    service = module.get<DeploymentsService>(DeploymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
