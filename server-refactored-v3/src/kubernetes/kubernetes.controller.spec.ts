import { Test, TestingModule } from '@nestjs/testing';
import { KubernetesController } from './kubernetes.controller';
import { KubernetesService } from './kubernetes.service';

describe('KubernetesController', () => {
  let controller: KubernetesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KubernetesController],
      providers: [
        {
          provide: KubernetesService,
          useValue: {
            getKubernetesInfo: jest.fn(),
            createKubernetesResource: jest.fn(),
            updateKubernetesResource: jest.fn(),
            deleteKubernetesResource: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<KubernetesController>(KubernetesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
