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
import { IKubectlApp } from 'src/kubernetes/kubernetes.interface';
import { RegistryService } from '../registry/registry.service';

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

const mockUSerGroups = ['group1', 'group2'];

export const mockKubectlApp = {
  apiVersion: 'kubero.io/v1',
  kind: 'KuberoApp',
  spec: mockApp,
  status: {},
} as IKubectlApp;

describe('AppsService', () => {
  let service: AppsService;
  let kubectl: jest.Mocked<KubernetesService>;
  let pipelinesService: jest.Mocked<PipelinesService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let configService: jest.Mocked<ConfigService>;
  let eventsGateway: jest.Mocked<EventsGateway>;
  let registryService: jest.Mocked<RegistryService>;
  const user: IUser = { id: '1', username: 'testuser' } as IUser;

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
        {
          provide: RegistryService,
          useValue: { makeTemporaryPushCredentialsForImage: jest.fn() }
        }
      ],
    }).compile();

    service = module.get<AppsService>(AppsService);
    kubectl = module.get(KubernetesService);
    pipelinesService = module.get(PipelinesService);
    notificationsService = module.get(NotificationsService);
    configService = module.get(ConfigService);
    eventsGateway = module.get(EventsGateway);
    registryService = module.get(RegistryService);
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
      const result = await service.getApp('p', 'ph', 'a', mockUSerGroups);
      expect(result).toBeDefined();
      expect(kubectl.getApp).toHaveBeenCalled();
    });
    it('should return null if context does not exist', async () => {
      (pipelinesService.getContext as jest.Mock).mockResolvedValue(null);
      const result = await service.getApp('p', 'ph', 'a', mockUSerGroups);
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
      await service.createApp(app, { username: 'u' } as any, mockUSerGroups);
      expect(kubectl.createApp).toHaveBeenCalled();
      expect(notificationsService.send).toHaveBeenCalled();
    });
    it('should not call createApp if readonly', async () => {
      process.env.KUBERO_READONLY = 'true';
      const app = new App(mockApp);
      await service.createApp(app, { username: 'u' } as any, mockUSerGroups);
      expect(kubectl.createApp).not.toHaveBeenCalled();
    });
  });

  describe('deleteApp', () => {
    beforeEach(() => {
      process.env.KUBERO_READONLY = 'false';
    });
    it('should call deleteApp and send notification', async () => {
      (pipelinesService.getContext as jest.Mock).mockResolvedValue('ctx');
      await service.deleteApp('p', 'ph', 'a', { username: 'u' } as any, mockUSerGroups);
      expect(kubectl.deleteApp).toHaveBeenCalled();
      expect(notificationsService.send).toHaveBeenCalled();
    });
    it('should not call deleteApp if readonly', async () => {
      process.env.KUBERO_READONLY = 'true';
      await service.deleteApp('p', 'ph', 'a', { username: 'u' } as any, mockUSerGroups);
      expect(kubectl.deleteApp).not.toHaveBeenCalled();
    });
  });

  describe('triggerImageBuild', () => {
    it('should call createBuildJob', async () => {
      (pipelinesService.getContext as jest.Mock).mockResolvedValue('ctx');
      (registryService.makeTemporaryPushCredentialsForImage as jest.Mock).mockResolvedValue({ username: 'fake', password: 'fake'});
      jest.spyOn(service, 'getApp').mockResolvedValue({
        spec: {
          gitrepo: { admin: true, ssh_url: 'repo' },
          buildstrategy: 'dockerfile',
          branch: 'main',
        },
      } as any);
      await service.triggerImageBuild('p', 'ph', 'a', mockUSerGroups);
      expect(kubectl.createBuildJob).toHaveBeenCalled();
      expect(registryService.makeTemporaryPushCredentialsForImage).toHaveBeenCalled();
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
      await service.rebuildApp(app, mockUSerGroups);
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
      await service.rebuildApp(app, mockUSerGroups);
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
      await service.updateApp(app, 'rv', { username: 'u' } as any, mockUSerGroups);
      expect(kubectl.updateApp).toHaveBeenCalled();
      expect(notificationsService.send).toHaveBeenCalled();
    });
    it('should not call updateApp if readonly', async () => {
      process.env.KUBERO_READONLY = 'true';
      const app = new App(mockApp);
      await service.updateApp(app, 'rv', { username: 'u' } as any, mockUSerGroups);
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
        {} as any, // RegistryService
      );
    });

    it('should not execute if no context is found', async () => {
      mockPipelinesService.getContext.mockResolvedValueOnce(undefined);
      await expect(
        service.execInContainer(
          'pipe',
          'dev',
          'app',
          'pod',
          'cont',
          'ls',
          user,
          mockUSerGroups,
        ),
      ).resolves.toBeUndefined();
    });

    it('should not execute if KUBERO_READONLY is true', async () => {
      process.env.KUBERO_READONLY = 'true';
      await expect(
        service.execInContainer(
          'pipe',
          'dev',
          'app',
          'pod',
          'cont',
          'ls',
          user,
          mockUSerGroups,
        ),
      ).resolves.toBeUndefined();
      delete process.env.KUBERO_READONLY;
    });

    it('should not execute if execStream already running and open', async () => {
      mockEventsGateway.execStreams['pipe-dev-app-pod-cont-terminal'] = {
        websocket: { readyState: 1, OPEN: 1 },
        stream: {},
      };
      await expect(
        service.execInContainer(
          'pipe',
          'dev',
          'app',
          'pod',
          'cont',
          'ls',
          user,
          mockUSerGroups,
        ),
      ).resolves.toBeUndefined();
    });

    it('should not set execStream if ws is undefined or not open', async () => {
      mockKubernetesService.execInContainer.mockResolvedValue(undefined);
      await expect(
        service.execInContainer(
          'pipe',
          'dev',
          'app',
          'pod',
          'cont',
          'ls',
          user,
          mockUSerGroups,
        ),
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

      await service.execInContainer(
        'pipe',
        'dev',
        'app',
        'pod',
        'cont',
        'ls',
        user,
        mockUSerGroups,
      );

      const streamname = 'pipe-dev-app-pod-cont-terminal';
      expect(mockEventsGateway.execStreams[streamname]).toBeDefined();
      expect(wsOnMock).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockEventsGateway.sendTerminalLine).toHaveBeenCalledWith(
        streamname,
        'test',
      );
    });
  });

  describe('AppsService - countApps', () => {
    let service: AppsService;
    let mockKubectl: any;

    beforeEach(() => {
      mockKubectl = {
        getCurrentContext: jest.fn(),
        getAllAppsList: jest.fn(),
      };

      service = new AppsService(
        mockKubectl,
        {} as any, // PipelinesService
        {} as any, // NotificationsService
        {} as any, // ConfigService
        {} as any, // EventsGateway
        {} as any, // RegistryService
      );
    });

    it('should return the number of apps', async () => {
      mockKubectl.getCurrentContext.mockReturnValue('test-context');
      mockKubectl.getAllAppsList.mockResolvedValue({ items: [{}, {}, {}] });

      const result = await service.countApps();
      expect(mockKubectl.getCurrentContext).toHaveBeenCalled();
      expect(mockKubectl.getAllAppsList).toHaveBeenCalledWith('test-context');
      expect(result).toBe(3);
    });

    it('should return 0 if no items', async () => {
      mockKubectl.getCurrentContext.mockReturnValue('test-context');
      mockKubectl.getAllAppsList.mockResolvedValue({ items: [] });

      const result = await service.countApps();
      expect(result).toBe(0);
    });

    it('should throw if getAllAppsList fails', async () => {
      mockKubectl.getCurrentContext.mockReturnValue('test-context');
      mockKubectl.getAllAppsList.mockRejectedValue(new Error('fail'));

      await expect(service.countApps()).rejects.toThrow('fail');
    });
  });

  describe('AppsService - triggerImageBuildDelayed', () => {
    let service: AppsService;

    beforeEach(() => {
      service = new AppsService(
        {} as any, // kubectl
        {} as any, // pipelinesService
        {} as any, // NotificationsService
        {} as any, // configService
        {} as any, // eventsGateway
        {} as any, // RegistryService
      );
      jest.spyOn(service, 'triggerImageBuild').mockResolvedValue({
        status: 'ok',
        message: 'build started',
        deploymentstrategy: 'git',
        pipeline: 'pipe',
        phase: 'dev',
        app: 'app1',
      });
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    });

    it('should wait 2 seconds and then call triggerImageBuild', async () => {
      const promise = service['triggerImageBuildDelayed'](
        'pipe',
        'dev',
        'app1',
        mockUSerGroups
      );
      // Fast-forward time by 2 seconds
      jest.advanceTimersByTime(2000);
      const result = await promise;
      expect(service.triggerImageBuild).toHaveBeenCalledWith(
        'pipe',
        'dev',
        'app1',
        ["group1", "group2"]
      );
      expect(result).toEqual({
        app: 'app1',
        deploymentstrategy: 'git',
        message: 'build started',
        phase: 'dev',
        pipeline: 'pipe',
        status: 'ok',
      });
    });
  });

  describe('AppsService - deletePRApp', () => {
    let service: AppsService;
    let mockGetAllAppsList: jest.Mock;
    let mockDeleteApp: jest.Mock;
    let mockLogger: any;

    beforeEach(() => {
      mockGetAllAppsList = jest.fn();
      mockDeleteApp = jest.fn();
      mockLogger = { debug: jest.fn() };

      service = new AppsService(
        {} as any, // kubectl
        {} as any, // pipelinesService
        {} as any, // NotificationsService
        {} as any, // configService
        {} as any, // eventsGateway
        {} as any, // RegistryService
      );
      // Methoden ersetzen
      service.getAllAppsList = mockGetAllAppsList;
      service.deleteApp = mockDeleteApp;
      service['logger'] = mockLogger;
    });

    it('should call deleteApp for matching PR apps', async () => {
      mockGetAllAppsList.mockResolvedValue([
        {
          phase: 'review',
          gitrepo: { ssh_url: 'git@github.com:foo/bar.git' },
          branch: 'feature-1',
          pipeline: 'pipeline1',
        },
        {
          phase: 'dev',
          gitrepo: { ssh_url: 'git@github.com:foo/bar.git' },
          branch: 'feature-1',
          pipeline: 'pipeline2',
        },
        {
          phase: 'review',
          gitrepo: { ssh_url: 'git@github.com:foo/bar.git' },
          branch: 'feature-2',
          pipeline: 'pipeline3',
        },
      ]);

      await service.deletePRApp(
        'feature-1',
        'My PR Title',
        'git@github.com:foo/bar.git',
        mockUSerGroups
      );

      // Erwartet: Nur das erste App-Objekt passt auf alle Kriterien
      expect(mockDeleteApp).toHaveBeenCalledTimes(1);
      expect(mockDeleteApp).toHaveBeenCalledWith(
        'pipeline1',
        'review',
        'my-pr-title', // websaveTitle
        { username: 'unknown' },
        ["group1", "group2"],
      );
    });

    it('should not call deleteApp if no app matches', async () => {
      mockGetAllAppsList.mockResolvedValue([
        {
          phase: 'dev',
          gitrepo: { ssh_url: 'git@github.com:foo/bar.git' },
          branch: 'feature-1',
          pipeline: 'pipeline1',
        },
      ]);
      await service.deletePRApp(
        'feature-2',
        'Other Title',
        'git@github.com:foo/bar.git',
        mockUSerGroups
      );
      expect(mockDeleteApp).not.toHaveBeenCalled();
    });

    it('should call getAllAppsList with correct context', async () => {
      mockGetAllAppsList.mockResolvedValue([]);
      process.env.KUBERO_CONTEXT = 'my-context';
      await service.deletePRApp(
        'feature-1',
        'My PR Title',
        'git@github.com:foo/bar.git',
        mockUSerGroups
      );
      expect(mockGetAllAppsList).toHaveBeenCalledWith('my-context');
      delete process.env.KUBERO_CONTEXT;
    });

    it('should log debug message', async () => {
      mockGetAllAppsList.mockResolvedValue([]);
      await service.deletePRApp(
        'feature-1',
        'My PR Title',
        'git@github.com:foo/bar.git',
        mockUSerGroups
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('destroyPRApp');
    });
  });

  describe('AppsService - createPRApp', () => {
    let service: AppsService;
    let mockPipelinesService: any;
    let mockConfigService: any;
    let mockKubectl: any;
    let mockNotificationsService: any;

    beforeEach(() => {
      process.env.KUBERO_READONLY = 'false';
      process.env.INGRESS_CLASSNAME = 'test-nginx';

      mockPipelinesService = {
        listPipelines: jest.fn(),
        getContext: jest.fn(),
      };

      mockConfigService = {
        getPodSizes: jest.fn().mockResolvedValue([podsize]),
      };

      mockKubectl = {};

      mockNotificationsService = {
        send: jest.fn(),
      };

      service = new AppsService(
        mockKubectl,
        mockPipelinesService,
        mockNotificationsService,
        mockConfigService,
        {} as any,
        {} as any, // RegistryService
      );

      service.createApp = jest.fn().mockResolvedValue(undefined);
      service['logger'] = { debug: jest.fn() } as any;
    });

    it('should return early if KUBERO_READONLY is true', async () => {
      process.env.KUBERO_READONLY = 'true';

      const result = await service.createPRApp(
        'feature-branch',
        'PR Title',
        'git@github.com:org/repo.git',
        undefined,
        mockUSerGroups,
      );

      expect(result).toBeUndefined();
      expect(service.createApp).not.toHaveBeenCalled();
    });

    it('should create an app in matching pipeline with reviewapps enabled', async () => {
      const mockPipelines = {
        items: [
          {
            name: 'pipeline1',
            reviewapps: false,
            git: { repository: { ssh_url: 'git@github.com:org/repo.git' } },
          },
          {
            name: 'pipeline2',
            reviewapps: true,
            git: { repository: { ssh_url: 'git@github.com:org/repo.git' } },
            phases: [
              {
                name: 'review',
                domain: 'example.com',
                defaultEnvvars: [{ name: 'VAR', value: 'value' }],
              },
            ],
            buildpack: { name: 'nodejs', fetch: {}, build: {}, run: {} },
            deploymentstrategy: 'git',
            dockerimage: 'node:14',
          },
          {
            name: 'pipeline3',
            reviewapps: true,
            git: {
              repository: { ssh_url: 'git@github.com:org/different-repo.git' },
            },
          },
        ],
      };

      mockPipelinesService.listPipelines.mockResolvedValue(mockPipelines);

      const result = await service.createPRApp(
        'feature-branch',
        'PR Title',
        'git@github.com:org/repo.git',
        undefined,
        mockUSerGroups
      );

      expect(result).toEqual({ status: 'ok', message: 'app created pr-title' });
      expect(service.createApp).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'pr-title',
          pipeline: 'pipeline2',
          phase: 'review',
          branch: 'feature-branch',
          gitrepo: { ssh_url: 'git@github.com:org/repo.git' },
          ingress: expect.objectContaining({
            enabled: true,
            className: 'test-nginx',
            hosts: [
              expect.objectContaining({
                host: 'pr-title.example.com',
              }),
            ],
          }),
        }),
        expect.objectContaining({ username: 'unknown' }),
        ["group1", "group2"],
      );
    });

    it('should filter by pipelineName if provided', async () => {
      const mockPipelines = {
        items: [
          {
            name: 'pipeline1',
            reviewapps: true,
            git: { repository: { ssh_url: 'git@github.com:org/repo.git' } },
            phases: [
              { name: 'review', domain: 'example1.com', defaultEnvvars: [] },
            ],
            buildpack: { name: 'nodejs', fetch: {}, build: {}, run: {} },
            deploymentstrategy: 'git',
            dockerimage: 'node:14',
          },
          {
            name: 'pipeline2',
            reviewapps: true,
            git: { repository: { ssh_url: 'git@github.com:org/repo.git' } },
            phases: [
              { name: 'review', domain: 'example2.com', defaultEnvvars: [] },
            ],
            buildpack: { name: 'nodejs', fetch: {}, build: {}, run: {} },
            deploymentstrategy: 'git',
            dockerimage: 'node:14',
          },
        ],
      };

      mockPipelinesService.listPipelines.mockResolvedValue(mockPipelines);

      await service.createPRApp(
        'feature-branch',
        'PR Title',
        'git@github.com:org/repo.git',
        'pipeline2',
        mockUSerGroups
      );

      expect(service.createApp).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'pr-title',
          pipeline: 'pipeline2',
        }),
        expect.anything(),
        ["group1", "group2"],
      );
    });

    it('should not create an app if no matching pipeline is found', async () => {
      const mockPipelines = {
        items: [
          {
            name: 'pipeline1',
            reviewapps: false,
            git: { repository: { ssh_url: 'git@github.com:org/repo.git' } },
          },
          {
            name: 'pipeline2',
            reviewapps: true,
            git: {
              repository: { ssh_url: 'git@github.com:org/different-repo.git' },
            },
          },
        ],
      };

      mockPipelinesService.listPipelines.mockResolvedValue(mockPipelines);

      const result = await service.createPRApp(
        'feature-branch',
        'PR Title',
        'git@github.com:org/repo.git',
        undefined,
        mockUSerGroups
      );

      expect(result).toBeUndefined();
      expect(service.createApp).not.toHaveBeenCalled();
    });

    it('should create app with sanitized name from title', async () => {
      const mockPipelines = {
        items: [
          {
            name: 'pipeline1',
            reviewapps: true,
            git: { repository: { ssh_url: 'git@github.com:org/repo.git' } },
            phases: [
              { name: 'review', domain: 'example.com', defaultEnvvars: [] },
            ],
            buildpack: { name: 'nodejs', fetch: {}, build: {}, run: {} },
            deploymentstrategy: 'git',
            dockerimage: 'node:14',
          },
        ],
      };

      mockPipelinesService.listPipelines.mockResolvedValue(mockPipelines);

      await service.createPRApp(
        'feature-branch',
        'Complex PR Title with 123 Special @#$ Characters!',
        'git@github.com:org/repo.git',
        undefined,
        mockUSerGroups
      );

      expect(service.createApp).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'complex-pr-title-with-123-special-----characters-',
        }),
        expect.anything(),
        ["group1", "group2"],
      );
    });
  });

  describe('getTemplate', () => {
    let service: AppsService;
    let mockGetApp: jest.Mock;
    let mockYAML: any;

    beforeEach(() => {
      mockGetApp = jest.fn();
      mockYAML = {
        stringify: jest.fn().mockReturnValue('yaml-output'),
      };

      service = new AppsService(
        {} as any, // kubectl
        {} as any, // pipelinesService
        {} as any, // NotificationsService
        {} as any, // ConfigService
        {} as any, // eventsGateway
        {} as any, // RegistryService
      );

      // Override the methods and properties
      service.getApp = mockGetApp;
      service['YAML'] = mockYAML;
    });

    it('should return a YAML template for an app', async () => {
      mockGetApp.mockResolvedValue(mockKubectlApp);

      const result = await service.getTemplate('pipeline1', 'dev', 'test-app', mockUSerGroups);

      expect(mockGetApp).toHaveBeenCalledWith('pipeline1', 'dev', 'test-app', ["group1", "group2"]);
      expect(mockYAML.stringify).toHaveBeenCalledWith(expect.any(Object), {
        indent: 4,
        resolveKnownTags: true,
      });
      expect(result).toBe('yaml-output');
    });
  });

  describe('AppsService - restartApp', () => {
    let service: AppsService;
    let mockKubectl: any;
    let mockPipelinesService: any;
    let mockNotificationsService: any;
    let mockLogger: any;

    beforeEach(() => {
      mockKubectl = {
        restartApp: jest.fn(),
      };
      mockPipelinesService = {
        getContext: jest.fn().mockResolvedValue('test-context'),
      };
      mockNotificationsService = {
        send: jest.fn(),
      };
      mockLogger = { debug: jest.fn() };

      service = new AppsService(
        mockKubectl,
        mockPipelinesService,
        mockNotificationsService,
        {} as any, // configService
        {} as any, // eventsGateway
        {} as any, // RegistryService
      );
      service['logger'] = mockLogger;
    });

    afterEach(() => {
      delete process.env.KUBERO_READONLY;
      jest.clearAllMocks();
    });

    it('should not restart app if KUBERO_READONLY is true', async () => {
      process.env.KUBERO_READONLY = 'true';
      const user = { id: '1', username: 'testuser' };
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await service.restartApp('pipe', 'dev', 'app1', user as any, mockUSerGroups);
      expect(mockKubectl.restartApp).not.toHaveBeenCalled();
      expect(mockNotificationsService.send).not.toHaveBeenCalled();
      logSpy.mockRestore();
    });

    it('should call restartApp for web and worker and send notification', async () => {
      const user = { id: '1', username: 'testuser' };
      await service.restartApp('pipe', 'dev', 'app1', user as any, mockUSerGroups);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'restart App: app1 in pipe phase: dev',
      );
      expect(mockPipelinesService.getContext).toHaveBeenCalledWith(
        'pipe',
        'dev',
        ["group1", "group2"],
      );
      expect(mockKubectl.restartApp).toHaveBeenCalledWith(
        'pipe',
        'dev',
        'app1',
        'web',
        'test-context',
      );
      expect(mockKubectl.restartApp).toHaveBeenCalledWith(
        'pipe',
        'dev',
        'app1',
        'worker',
        'test-context',
      );
      expect(mockNotificationsService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'restartApp',
          user: '1',
          resource: 'app',
          action: 'restart',
          pipelineName: 'pipe',
          phaseName: 'dev',
          appName: 'app1',
        }),
      );
    });

    it('should do nothing if getContext returns undefined', async () => {
      mockPipelinesService.getContext.mockResolvedValueOnce(undefined);
      const user = { id: '1', username: 'testuser' };
      await service.restartApp('pipe', 'dev', 'app1', user as any, mockUSerGroups);
      expect(mockKubectl.restartApp).not.toHaveBeenCalled();
      expect(mockNotificationsService.send).not.toHaveBeenCalled();
    });
  });

  describe('AppsService - getPods', () => {
    let service: AppsService;
    let mockKubectl: any;
    let mockPipelinesService: any;

    beforeEach(() => {
      mockKubectl = {
        setCurrentContext: jest.fn(),
        getPods: jest.fn(),
      };
      mockPipelinesService = {
        getContext: jest.fn(),
      };

      service = new AppsService(
        mockKubectl,
        mockPipelinesService,
        {} as any, // NotificationsService
        {} as any, // ConfigService
        {} as any, // EventsGateway
        {} as any, // RegistryService
      );
    });

    it('should return empty array if no context is found', async () => {
      mockPipelinesService.getContext.mockResolvedValue(undefined);
      const result = await service.getPods('pipe', 'dev', 'app1', mockUSerGroups);
      expect(result).toEqual([]);
      expect(mockKubectl.setCurrentContext).not.toHaveBeenCalled();
      expect(mockKubectl.getPods).not.toHaveBeenCalled();
    });

    it('should return filtered workloads with containers', async () => {
      mockPipelinesService.getContext.mockResolvedValue('test-context');
      mockKubectl.getPods.mockResolvedValue([
        {
          metadata: {
            name: 'pod-1',
            namespace: 'pipe-dev',
            generateName: 'app1-kuberoapp-',
            creationTimestamp: '2024-01-01T00:00:00Z',
          },
          status: {
            phase: 'Running',
            startTime: '2024-01-01T00:00:00Z',
            containerStatuses: [
              { restartCount: 1, ready: true, started: true },
              { restartCount: 0, ready: false, started: false },
            ],
          },
          spec: {
            containers: [
              { name: 'web', image: 'nginx:latest' },
              { name: 'worker', image: 'node:18' },
            ],
          },
        },
        {
          metadata: {
            name: 'pod-2',
            namespace: 'pipe-dev',
            generateName: 'otherapp-kuberoapp-',
            creationTimestamp: '2024-01-01T01:00:00Z',
          },
          status: {
            phase: 'Pending',
            startTime: '2024-01-01T01:00:00Z',
            containerStatuses: [],
          },
          spec: {
            containers: [],
          },
        },
      ]);

      const result = await service.getPods('pipe', 'dev', 'app1', mockUSerGroups);
      expect(mockPipelinesService.getContext).toHaveBeenCalledWith(
        'pipe',
        'dev',
        ["group1", "group2"],
      );
      expect(mockKubectl.setCurrentContext).toHaveBeenCalledWith(
        'test-context',
      );
      expect(mockKubectl.getPods).toHaveBeenCalledWith(
        'pipe-dev',
        'test-context',
      );
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        name: 'pod-1',
        namespace: 'pipe-dev',
        phase: 'dev',
        pipeline: 'pipe',
        status: 'Running',
        age: '2024-01-01T00:00:00Z',
        startTime: '2024-01-01T00:00:00Z',
        containers: [
          {
            name: 'web',
            image: 'nginx:latest',
            restartCount: 1,
            ready: true,
            started: true,
          },
          {
            name: 'worker',
            image: 'node:18',
            restartCount: 0,
            ready: false,
            started: false,
          },
        ],
      });
    });

    it('should skip pods whose generateName does not match', async () => {
      mockPipelinesService.getContext.mockResolvedValue('test-context');
      mockKubectl.getPods.mockResolvedValue([
        {
          metadata: {
            name: 'pod-2',
            namespace: 'pipe-dev',
            generateName: 'otherapp-kuberoapp-',
            creationTimestamp: '2024-01-01T01:00:00Z',
          },
          status: {
            phase: 'Pending',
            startTime: '2024-01-01T01:00:00Z',
            containerStatuses: [],
          },
          spec: {
            containers: [],
          },
        },
      ]);
      const result = await service.getPods('pipe', 'dev', 'app1', mockUSerGroups);
      expect(result).toEqual([]);
    });
  });
});
