import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsService } from './deployments.service';

describe('DeploymentsController', () => {
  let controller: DeploymentsController;
  let service: jest.Mocked<DeploymentsService>;

  beforeEach(async () => {
    service = {
      listBuildjobs: jest.fn().mockResolvedValue([{ name: 'build1' }]),
      triggerBuildjob: jest.fn().mockResolvedValue({ ok: true }),
      deleteBuildjob: jest.fn().mockResolvedValue({ ok: true }),
      getBuildLogs: jest.fn().mockResolvedValue([{ log: 'line1' }]),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeploymentsController],
      providers: [
        {
          provide: DeploymentsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<DeploymentsController>(DeploymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get deployments', async () => {
    const result = await controller.getDeployments('pipe', 'phase', 'app');
    expect(service.listBuildjobs).toHaveBeenCalledWith('pipe', 'phase', 'app');
    expect(result).toEqual([{ name: 'build1' }]);
  });

  it('should build app', async () => {
    const body = {
      buildstrategy: 'dockerfile',
      repository: 'repo',
      reference: 'main',
      dockerfilePath: 'Dockerfile',
    };
    const result = await controller.buildApp(
      'pipe',
      'phase',
      'app',
      body as any,
    );
    expect(service.triggerBuildjob).toHaveBeenCalledWith(
      'pipe',
      'phase',
      'app',
      'dockerfile',
      'repo',
      'main',
      'Dockerfile',
      expect.objectContaining({ username: 'admin' }),
    );
    expect(result).toEqual({ ok: true });
  });

  it('should delete app', async () => {
    const result = await controller.deleteApp('pipe', 'phase', 'app', 'build1');
    expect(service.deleteBuildjob).toHaveBeenCalledWith(
      'pipe',
      'phase',
      'app',
      'build1',
      expect.objectContaining({ username: 'admin' }),
    );
    expect(result).toEqual({ ok: true });
  });

  it('should get logs', async () => {
    const result = await controller.getLogs(
      'pipe',
      'phase',
      'app',
      'build1',
      'web',
    );
    expect(service.getBuildLogs).toHaveBeenCalledWith(
      'pipe',
      'phase',
      'app',
      'build1',
      'web',
    );
    expect(result).toEqual([{ log: 'line1' }]);
  });

  it('should deploy tag', async () => {
    // Add deployApp mock to the service
    service.deployApp = jest.fn();

    const result = await controller.deployTag('pipe', 'phase', 'app', 'v1.0.0');

    expect(service.deployApp).toHaveBeenCalledWith(
      'pipe',
      'phase',
      'app',
      'v1.0.0',
    );

    expect(result).toEqual({
      message:
        'Deployment triggered for app in pipe phase phase with tag v1.0.0',
      status: 'success',
    });
  });
});
