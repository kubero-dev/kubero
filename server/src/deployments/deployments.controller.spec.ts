import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsService } from './deployments.service';
import { mock } from 'node:test';

const mockUser = {
  id: 1,
  strategy: 'local',
  username: 'admin',
};

const mockUserGroups = ['group1', 'group2'];

const mockJWT = {
  userId: 1,
  strategy: 'local',
  username: 'admin',
  apitoken: '1234567890',
  userGroups: mockUserGroups,
};

const mockReq = { user: mockJWT };

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
    const result = await controller.getDeployments(
      'pipe',
      'phase',
      'app',
      mockReq,
    );
    expect(service.listBuildjobs).toHaveBeenCalledWith(
      'pipe',
      'phase',
      'app',
      mockUserGroups,
    );
    expect(result).toEqual([{ name: 'build1' }]);
  });

  it('should build app', async () => {
    const body = {
      buildstrategy: 'dockerfile',
      repository: 'repo',
      reference: 'main',
      dockerfilePath: 'Dockerfile',
    };
    const req = { user: mockJWT };
    const result = await controller.buildApp(
      'pipe',
      'phase',
      'app',
      body as any,
      req,
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
    const req = { user: mockJWT };
    const result = await controller.deleteApp(
      'pipe',
      'phase',
      'app',
      'build1',
      req,
    );
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
      mockReq,
    );
    expect(service.getBuildLogs).toHaveBeenCalledWith(
      'pipe',
      'phase',
      'app',
      'build1',
      'web',
      mockUserGroups,
    );
    expect(result).toEqual([{ log: 'line1' }]);
  });

  it('should deploy tag', async () => {
    // Add deployApp mock to the service
    service.deployApp = jest.fn();

    const result = await controller.deployTag(
      'pipe',
      'phase',
      'app',
      'v1.0.0',
      mockReq,
    );

    expect(service.deployApp).toHaveBeenCalledWith(
      'pipe',
      'phase',
      'app',
      'v1.0.0',
      mockUserGroups,
    );

    expect(result).toEqual({
      message:
        'Deployment triggered for app in pipe phase phase with tag v1.0.0',
      status: 'success',
    });
  });
});
