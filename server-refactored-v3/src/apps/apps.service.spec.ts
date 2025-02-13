import { Test, TestingModule } from '@nestjs/testing';
import { AppsService } from './apps.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { IKubectlApp } from 'src/kubernetes/kubernetes.interface';

describe('AppsService', () => {
  let service: AppsService;
  let kubernetesService: KubernetesService;
  let pipelinesService: PipelinesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppsService,
        {
          provide: KubernetesService,
          useValue: {
            getApp: jest.fn(),
          },
        },
        {
          provide: PipelinesService,
          useValue: {
            getContext: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppsService>(AppsService);
    kubernetesService = module.get<KubernetesService>(KubernetesService);
    pipelinesService = module.get<PipelinesService>(PipelinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get app', async () => {
    const pipelineName = 'test-pipeline';
    const phaseName = 'test-phase';
    const appName = 'test-app';
    const contextName = 'test-context';
    const app = {} as IKubectlApp;

    jest.spyOn(pipelinesService, 'getContext').mockResolvedValue(contextName);
    jest.spyOn(kubernetesService, 'getApp').mockResolvedValue(app);

    const result = await service.getApp(pipelineName, phaseName, appName);

    expect(pipelinesService.getContext).toHaveBeenCalledWith(
      pipelineName,
      phaseName,
    );
    expect(kubernetesService.getApp).toHaveBeenCalledWith(
      pipelineName,
      phaseName,
      appName,
      contextName,
    );
    expect(result).toBe(app);
  });

  it('should return undefined if context is not found', async () => {
    const pipelineName = 'test-pipeline';
    const phaseName = 'test-phase';
    const appName = 'test-app';

    jest
      .spyOn(pipelinesService, 'getContext')
      .mockResolvedValue('example-context');

    const result = await service.getApp(pipelineName, phaseName, appName);

    expect(pipelinesService.getContext).toHaveBeenCalledWith(
      pipelineName,
      phaseName,
    );
    expect(kubernetesService.getApp).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
