import { Test, TestingModule } from '@nestjs/testing';
import { AppsService } from './apps.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '../config/config.service';
import { EventsGateway } from '../events/events.gateway';
import { App } from './app/app';
import { IApp } from './apps.interface';
import { IPodSize, ISecurityContext } from 'src/config/config.interface';
import { IUser } from 'src/auth/auth.interface';

const podsize: IPodSize = {
  name: 'small',
  resources: {},
  description: '',
};

const mockSecurityContext: ISecurityContext = {
  runAsUser: 1000,
  runAsGroup: 1000,
  allowPrivilegeEscalation: false,
  readOnlyRootFilesystem: false,
  runAsNonRoot: true,
  capabilities: { add: [], drop: [] },
};

const mockApp = {
  name: 'app',
  pipeline: 'pipeline',
  phase: 'phase',
  sleep: 'false',
  buildpack: 'nodejs',
  deploymentstrategy: 'git' as const,
  buildstrategy: 'plain' as const,
  branch: 'main',
  autodeploy: true,
  podsize,
  autoscale: false,
  basicAuth: {
    enabled: true,
    realm: 'TestRealm',
    accounts: [
      { user: 'user1', pass: 'pass1' },
      { user: 'user2', pass: 'pass2' },
    ],
  },
  envVars: [],
  extraVolumes: [],
  cronjobs: [],
  addons: [],
  web: {
    replicaCount: 1,
    autoscaling: { minReplicas: 1, maxReplicas: 2 },
  },
  worker: {
    replicaCount: 1,
    autoscaling: { minReplicas: 1, maxReplicas: 2 },
  },
  image: {
    containerPort: 8080,
    repository: 'repo',
    tag: 'tag',
    command: ['npm'],
    fetch: {
      repository: 'repo',
      tag: 'tag',
      securityContext: mockSecurityContext,
    },
    build: {
      repository: 'repo',
      tag: 'tag',
      securityContext: mockSecurityContext,
    },
    run: {
      repository: 'repo',
      tag: 'tag',
      securityContext: mockSecurityContext,
    },
    pullPolicy: 'Always',
  },
  vulnerabilityscan: {
    enabled: false,
    schedule: '* * * * *',
    image: { repository: 'repo', tag: 'tag' },
  },
  serviceAccount: { annotations: {}, create: true, name: 'svc' },
  ingress: {
    annotations: {},
    className: '',
    enabled: false,
    hosts: [{ host: 'localhost', paths: [{ path: '/', pathType: 'Prefix' }] }],
    tls: [],
  },
  healthcheck: {
    enabled: true,
    path: '/health',
    startupSeconds: 1,
    timeoutSeconds: 1,
    periodSeconds: 1,
  },
  resources: {
    limits: { cpu: '100m', memory: '128Mi' },
    requests: { cpu: '100m', memory: '128Mi' },
  },
} as IApp;

describe('AppsService', () => {
  let service: AppsService;
  let kubectl: jest.Mocked<KubernetesService>;
  let pipelinesService: jest.Mocked<PipelinesService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let configService: jest.Mocked<ConfigService>;
  let eventsGateway: jest.Mocked<EventsGateway>;
  let user: IUser = { username: 'testuser' } as IUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppsService,
        {
          provide: KubernetesService,
          useValue: {
            getApp: jest.fn(),
            createApp: jest.fn(),
            deleteApp: jest.fn(),
            setCurrentContext: jest.fn(),
            createBuildJob: jest.fn(),
            getAllAppsList: jest.fn(),
            restartApp: jest.fn(),
            getPods: jest.fn(),
            updateApp: jest.fn(),
            execInContainer: jest.fn(),
          },
        },
        {
          provide: PipelinesService,
          useValue: { getContext: jest.fn(), listPipelines: jest.fn() },
        },
        { provide: NotificationsService, useValue: { send: jest.fn() } },
        { provide: ConfigService, useValue: { getPodSizes: jest.fn() } },
        {
          provide: EventsGateway,
          useValue: { execStreams: {}, sendTerminalLine: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AppsService>(AppsService);
    kubectl = module.get(KubernetesService);
    pipelinesService = module.get(PipelinesService);
    notificationsService = module.get(NotificationsService);
    configService = module.get(ConfigService);
    eventsGateway = module.get(EventsGateway);
    
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getApp', () => {
    it('should return app if context exists', async () => {
      (pipelinesService.getContext as jest.Mock).mockResolvedValue('ctx');
      (kubectl.getApp as jest.Mock).mockResolvedValue({
        metadata: {},
        status: {},
      });
      const result = await service.getApp('p', 'ph', 'a');
      expect(result).toBeDefined();
      expect(kubectl.getApp).toHaveBeenCalled();
    });
    it('should return null if context does not exist', async () => {
      (pipelinesService.getContext as jest.Mock).mockResolvedValue(null);
      const result = await service.getApp('p', 'ph', 'a');
      expect(result).toBeUndefined();
    });
  });

  describe('createApp', () => {
    beforeEach(() => {
      process.env.KUBERO_READONLY = 'false';
    });
    it('should call createApp and send notification', async () => {
      (pipelinesService.getContext as jest.Mock).mockResolvedValue('ctx');
      const app = new App(mockApp);
      await service.createApp(app, { username: 'u' } as any);
      expect(kubectl.createApp).toHaveBeenCalled();
      expect(notificationsService.send).toHaveBeenCalled();
    });
    it('should not call createApp if readonly', async () => {
      process.env.KUBERO_READONLY = 'true';
      const app = new App(mockApp);
      await service.createApp(app, { username: 'u' } as any);
      expect(kubectl.createApp).not.toHaveBeenCalled();
    });
  });

  describe('deleteApp', () => {
    beforeEach(() => {
      process.env.KUBERO_READONLY = 'false';
    });
    it('should call deleteApp and send notification', async () => {
      (pipelinesService.getContext as jest.Mock).mockResolvedValue('ctx');
      await service.deleteApp('p', 'ph', 'a', { username: 'u' } as any);
      expect(kubectl.deleteApp).toHaveBeenCalled();
      expect(notificationsService.send).toHaveBeenCalled();
    });
    it('should not call deleteApp if readonly', async () => {
      process.env.KUBERO_READONLY = 'true';
      await service.deleteApp('p', 'ph', 'a', { username: 'u' } as any);
      expect(kubectl.deleteApp).not.toHaveBeenCalled();
    });
  });

  describe('triggerImageBuild', () => {
    it('should call createBuildJob', async () => {
      (pipelinesService.getContext as jest.Mock).mockResolvedValue('ctx');
      jest.spyOn(service, 'getApp').mockResolvedValue({
        spec: {
          gitrepo: { admin: true, ssh_url: 'repo' },
          buildstrategy: 'dockerfile',
          branch: 'main',
        },
      } as any);
      await service.triggerImageBuild('p', 'ph', 'a');
      expect(kubectl.createBuildJob).toHaveBeenCalled();
    });
  });

  describe('getAllAppsList', () => {
    it('should return list of apps', async () => {
      (kubectl.getAllAppsList as jest.Mock).mockResolvedValue({
        items: [{ spec: { name: 'a' } }],
      });
      const result = await service.getAllAppsList('ctx');
      expect(result).toEqual([{ name: 'a' }]);
    });
  });

  describe('getAppsByRepoAndBranch', () => {
    it('should filter apps by repo and branch', async () => {
      jest.spyOn(service, 'getAllAppsList').mockResolvedValue([
        { branch: 'main', gitrepo: { ssh_url: 'repo' } },
        { branch: 'dev', gitrepo: { ssh_url: 'repo' } },
      ] as any);
      const result = await service.getAppsByRepoAndBranch('repo', 'main');
      expect(result.length).toBe(1);
      expect(result[0].branch).toBe('main');
    });
  });

  describe('rebuildApp', () => {
    it('should call restartApp for docker/plain', async () => {
      (pipelinesService.getContext as jest.Mock).mockResolvedValue('ctx');
      const app = {
        name: 'a',
        pipeline: 'p',
        phase: 'ph',
        deploymentstrategy: 'docker',
        buildstrategy: 'plain',
      } as any;
      await service.rebuildApp(app);
      expect(kubectl.restartApp).toHaveBeenCalled();
      expect(notificationsService.send).toHaveBeenCalled();
    });
    it('should call triggerImageBuild for git/dockerfile', async () => {
      (pipelinesService.getContext as jest.Mock).mockResolvedValue('ctx');
      const app = {
        name: 'a',
        pipeline: 'p',
        phase: 'ph',
        deploymentstrategy: 'git',
        buildstrategy: 'dockerfile',
      } as any;
      const spy = jest
        .spyOn(service, 'triggerImageBuild')
        .mockResolvedValue({} as any);
      await service.rebuildApp(app);
      expect(spy).toHaveBeenCalled();
      expect(notificationsService.send).toHaveBeenCalled();
    });
  });

  describe('updateApp', () => {
    beforeEach(() => {
      process.env.KUBERO_READONLY = 'false';
    });
    it('should call updateApp and send notification', async () => {
      (pipelinesService.getContext as jest.Mock).mockResolvedValue('ctx');
      const app = new App(mockApp);
      await service.updateApp(app, 'rv', { username: 'u' } as any);
      expect(kubectl.updateApp).toHaveBeenCalled();
      expect(notificationsService.send).toHaveBeenCalled();
    });
    it('should not call updateApp if readonly', async () => {
      process.env.KUBERO_READONLY = 'true';
      const app = new App(mockApp);
      await service.updateApp(app, 'rv', { username: 'u' } as any);
      expect(kubectl.updateApp).not.toHaveBeenCalled();
    });
  });

  describe('execInContainer', () => {
    let service: AppsService;
    let mockPipelinesService: any;
    let mockKubernetesService: any;
    let mockEventsGateway: any;

    beforeEach(() => {
      mockPipelinesService = {
        getContext: jest.fn().mockResolvedValue('test-context'),
      };
      mockKubernetesService = {
        execInContainer: jest.fn(),
      };
      mockEventsGateway = {
        execStreams: {},
        sendTerminalLine: jest.fn(),
      };

      service = new AppsService(
        mockKubernetesService,
        mockPipelinesService,
        {} as any, // NotificationsService
        {} as any, // ConfigService
        mockEventsGateway,
      );
    });

    it('should not execute if no context is found', async () => {
      mockPipelinesService.getContext.mockResolvedValueOnce(undefined);
      await expect(
        service.execInContainer('pipe', 'dev', 'app', 'pod', 'cont', 'ls', user)
      ).resolves.toBeUndefined();
    });

    it('should not execute if KUBERO_READONLY is true', async () => {
      process.env.KUBERO_READONLY = 'true';
      await expect(
        service.execInContainer('pipe', 'dev', 'app', 'pod', 'cont', 'ls', user)
      ).resolves.toBeUndefined();
      delete process.env.KUBERO_READONLY;
    });

    it('should not execute if execStream already running and open', async () => {
      mockEventsGateway.execStreams['pipe-dev-app-pod-cont-terminal'] = {
        websocket: { readyState: 1, OPEN: 1 },
        stream: {},
      };
      await expect(
        service.execInContainer('pipe', 'dev', 'app', 'pod', 'cont', 'ls', user)
      ).resolves.toBeUndefined();
    });

    /* Long running test.
    thrown: "Exceeded timeout of 5000 ms for a test.
    Add a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout."
    it('should delete closed execStream and continue', async () => {
      jest.useFakeTimers();
      const wsMock = { readyState: 0, OPEN: 1, CLOSED: 0, on: jest.fn() };
      mockEventsGateway.execStreams['pipe-dev-app-pod-cont-terminal'] = {
        websocket: { readyState: 0, OPEN: 1, CLOSED: 0 },
        stream: {},
      };
      mockKubernetesService.execInContainer.mockResolvedValue(wsMock);

      await service.execInContainer('pipe', 'dev', 'app', 'pod', 'cont', 'ls', user);
      // Fast-forward timers to resolve setTimeout
      jest.runAllTimers();
      expect(mockKubernetesService.execInContainer).toHaveBeenCalled();
      jest.useRealTimers();
    });
    */

    it('should not set execStream if ws is undefined or not open', async () => {
      mockKubernetesService.execInContainer.mockResolvedValue(undefined);
      await expect(
        service.execInContainer('pipe', 'dev', 'app', 'pod', 'cont', 'ls', user)
      ).resolves.toBeUndefined();
    });

    it('should set execStream and handle ws message', async () => {
      const wsOnMock = jest.fn((event, cb) => {
        if (event === 'message') {
          cb(Buffer.from('test'));
        }
      });
      const wsMock = { readyState: 1, OPEN: 1, on: wsOnMock };
      mockKubernetesService.execInContainer.mockResolvedValue(wsMock);

      await service.execInContainer('pipe', 'dev', 'app', 'pod', 'cont', 'ls', user);

      const streamname = 'pipe-dev-app-pod-cont-terminal';
      expect(mockEventsGateway.execStreams[streamname]).toBeDefined();
      expect(wsOnMock).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockEventsGateway.sendTerminalLine).toHaveBeenCalledWith(streamname, 'test');
    });
  });
});
