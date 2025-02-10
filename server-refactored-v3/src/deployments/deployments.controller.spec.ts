import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentsController } from './deployments.controller';

describe('DeploymentsController', () => {
  let controller: DeploymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeploymentsController],
    }).compile();

    controller = module.get<DeploymentsController>(DeploymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
