import { DeploymentsService } from './deployments.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { AppsService } from '../apps/apps.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { LogsService } from '../logs/logs.service';
import { IUser } from '../auth/auth.interface';
import { ILoglines } from 'src/logs/logs.interface';
import { mockKubectlApp as app } from '../apps/apps.controller.spec';
import { RegistryService } from 'src/registry/registry.service';

const mockUserGroups = ['group1', 'group2'];

const mockUser: IUser = {
  username: 'testuser',
  userId: 'testuser',
  role: 'user',
  userGroups: mockUserGroups,
} as any;


describe('DeploymentsService', () => {
  let service: DeploymentsService;
  let kubectl: jest.Mocked<KubernetesService>;
  let appsService: jest.Mocked<AppsService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let pipelinesService: jest.Mocked<PipelinesService>;
  let logsService: jest.Mocked<LogsService>;
  let logLine: jest.Mocked<ILoglines>;
  let registryService: jest.Mocked<RegistryService>;

  beforeEach(() => {
    kubectl = {
      getJobs: jest.fn(),
      createBuildJob: jest.fn(),
      deleteKuberoBuildJob: jest.fn(),
      getPods: jest.fn(),
    } as any;

    appsService = {
      getApp: jest.fn(),
    } as any;

    notificationsService = {
      send: jest.fn(),
    } as any;

    pipelinesService = {
      getContext: jest.fn(),
    } as any;

    logsService = {
      fetchLogs: jest.fn(),
    } as any;

    registryService = {
      makeTemporaryPushCredentialsForImage: jest.fn().mockResolvedValue({ username: 'fake', password: 'fake' }),
    } as any;

    service = new DeploymentsService(
      kubectl,
      appsService,
      notificationsService,
      pipelinesService,
      logsService,
      registryService
    );

    logLine = {
      id: 'logline',
      time: 12345566,
      pipeline: 'pipeline',
      phase: 'phase',
      app: 'app',
      pod: 'pod',
      podID: 'podID',
      container: 'container',
      color: 'color',
      log: 'line1',
    } as ILoglines;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listBuildjobs', () => {
    it('should return empty items if no jobs', async () => {
      kubectl.getJobs.mockResolvedValue(undefined);
      appsService.getApp.mockResolvedValue(app);
      const result = await service.listBuildjobs('pipe', 'phase', 'app', mockUserGroups);
      expect(result).toEqual({ items: [] });
    });

    it('should return buildjobs for matching app', async () => {
      kubectl.getJobs.mockResolvedValue({
        items: [
          {
            metadata: {
              creationTimestamp: '2024-05-23T12:00:00Z',
              name: 'job1',
              labels: {
                kuberoapp: 'app',
                kuberopipeline: 'pipe',
                kuberophase: 'phase',
                buildstrategy: 'dockerfile',
              },
            },
            spec: {
              backoffLimit: 1,
              template: {
                spec: {
                  initContainers: [
                    {
                      env: [
                        { name: 'GIT_REPOSITORY', value: 'repo' },
                        { name: 'GIT_REF', value: 'main' },
                      ],
                    },
                  ],
                  containers: [
                    {
                      env: [
                        { name: 'REPOSITORY', value: 'repoimg' },
                        { name: 'TAG', value: 'latest' },
                      ],
                    },
                  ],
                },
              },
            },
            status: {
              failed: 0,
              active: 1,
              succeeded: 0,
              startTime: '2024-05-23T12:00:00Z',
              conditions: [{ lastProbeTime: '2024-05-23T12:10:00Z' }],
            },
          },
        ],
      });
      appsService.getApp.mockResolvedValue(app);
      const result = await service.listBuildjobs('pipe', 'phase', 'app', mockUserGroups);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe('job1');
      expect(result[0].app).toBe('app');
    });

    it('should skip jobs not matching app', async () => {
      kubectl.getJobs.mockResolvedValue({
        items: [
          {
            metadata: {
              creationTimestamp: '2024-05-23T12:00:00Z',
              name: 'job2',
              labels: {
                kuberoapp: 'otherapp',
                kuberopipeline: 'pipe',
                kuberophase: 'phase',
                buildstrategy: 'dockerfile',
              },
            },
            spec: {
              backoffLimit: 1,
              template: {
                spec: {
                  initContainers: [
                    {
                      env: [
                        { name: 'GIT_REPOSITORY', value: 'repo' },
                        { name: 'GIT_REF', value: 'main' },
                      ],
                    },
                  ],
                  containers: [
                    {
                      env: [
                        { name: 'REPOSITORY', value: 'repoimg' },
                        { name: 'TAG', value: 'latest' },
                      ],
                    },
                  ],
                },
              },
            },
            status: {},
          },
        ],
      });
      appsService.getApp.mockResolvedValue(app);
      const result = await service.listBuildjobs('pipe', 'phase', 'app', mockUserGroups);
      expect(result).toEqual([]);
    });
  });

  describe('triggerBuildjob', () => {
    it('should not trigger build if KUBERO_READONLY is true', async () => {
      process.env.KUBERO_READONLY = 'true';
      const user: IUser = { username: 'test' } as any;
      const result = await service.triggerBuildjob(
        'pipe',
        'phase',
        'app',
        'dockerfile',
        'repo',
        'main',
        'Dockerfile',
        user,
      );
      expect(result).toBeUndefined();
      delete process.env.KUBERO_READONLY;
    });

    it('should trigger build and send notification', async () => {
      process.env.KUBERO_BUILD_REGISTRY = 'reg';
      const user: IUser = { username: 'test' } as any;
      await service.triggerBuildjob(
        'pipe',
        'phase',
        'app',
        'dockerfile',
        'repo',
        'main',
        'Dockerfile',
        user,
      );
      expect(kubectl.createBuildJob).toHaveBeenCalled();
      expect(notificationsService.send).toHaveBeenCalled();
      delete process.env.KUBERO_BUILD_REGISTRY;
    });
  });

  describe('deleteBuildjob', () => {
    it('should not delete build if KUBERO_READONLY is true', async () => {
      process.env.KUBERO_READONLY = 'true';
      const user: IUser = { username: 'test' } as any;
      const result = await service.deleteBuildjob(
        'pipe',
        'phase',
        'app',
        'build1',
        user,
      );
      expect(result).toBeUndefined();
      delete process.env.KUBERO_READONLY;
    });

    it('should delete build and send notification', async () => {
      const user: IUser = { username: 'test' } as any;
      await service.deleteBuildjob('pipe', 'phase', 'app', 'build1', user);
      expect(kubectl.deleteKuberoBuildJob).toHaveBeenCalled();
      expect(notificationsService.send).toHaveBeenCalled();
    });
  });

  describe('getBuildLogs', () => {
    it('should return loglines for matching pods', async () => {
      pipelinesService.getContext.mockResolvedValue('ctx');
      kubectl.getPods.mockResolvedValue([
        {
          metadata: {
            name: 'pod1',
            labels: {
              kuberoapp: 'app',
              'job-name': 'build1',
            },
          },
        },
      ]);
      logsService.fetchLogs.mockResolvedValue([logLine]);
      const result = await service.getBuildLogs(
        'pipe',
        'phase',
        'app',
        'build1',
        'web',
        mockUserGroups,
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].log).toBe('line1');
    });
  });
});
