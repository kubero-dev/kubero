import { Test, TestingModule } from '@nestjs/testing';
import { KubernetesController } from './kubernetes.controller';

describe('KubernetesController', () => {
  let controller: KubernetesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KubernetesController],
    }).compile();

    controller = module.get<KubernetesController>(KubernetesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
