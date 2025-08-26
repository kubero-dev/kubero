import { ConfigService } from './config.service';
import { PodSize } from './podsize/podsize';
import { Runpack } from './buildpack/runpack';

// Mock PrismaClient
const mockPrismaClient = {
  runpack: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  podSize: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  runpackPhase: {
    create: jest.fn(),
  },
  capabilityAdd: {
    createMany: jest.fn(),
  },
  capabilityDrop: {
    createMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => '"1.2.3"'),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  constants: { O_CREAT: 0, O_WRONLY: 1, O_TRUNC: 2 },
}));
jest.mock('yaml', () => ({
  parse: jest.fn(() => ({
    kubero: {
      admin: { disabled: false },
      banner: { show: true },
      config: {},
      podSizeList: [],
      buildpacks: [],
      clusterissuer: 'issuer',
    },
    templates: { enabled: true },
  })),
  stringify: jest.fn(() => 'yaml-content'),
}));
jest.mock('path', () => ({
  join: (...args: any[]) => '/mock/path/config.yaml',
  resolve: (...args: any[]) => '/mock/path/VERSION',
  dirname: (...args: any[]) => '/mock/path',
  extname: (...args: any[]) => '.so',
}));
jest.mock('bcrypt', () => ({
  hashSync: jest.fn(() => 'hashed'),
  genSaltSync: jest.fn(() => 'salt'),
}));
jest.mock('sqlite3', () => {
  return {
    Database: jest.fn().mockImplementation(() => ({
      run: jest.fn(),
      all: jest.fn(),
      get: jest.fn(),
      close: jest.fn(),
    })),
  };
});

describe('ConfigService', () => {
  let service: ConfigService;
  let kubectl: any;
  let notification: any;

  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();

    kubectl = {
      getKuberoConfig: jest.fn().mockResolvedValue({
        spec: {
          kubero: {
            admin: { disabled: false },
            banner: {
              show: true,
              text: 'Banner',
              bgcolor: 'blue',
              fontcolor: 'white',
              config: {},
              podSizeList: [],
              buildpacks: [],
              clusterissuer: 'issuer',
            },
            config: {
              buildpacks: [],
              podSizeList: [],
              clusterissuer: 'issuer',
            },
            console: { enabled: true },
          },
          registry: { host: 'registry', enabled: true },
          templates: { enabled: true },
        },
      }),
      updateKuberoConfig: jest.fn(),
      updateKuberoSecret: jest.fn(),
      validateKubeconfig: jest.fn().mockResolvedValue({ valid: true }),
      updateKubectlConfig: jest.fn(),
      createNamespace: jest.fn(),
      checkNamespace: jest.fn().mockResolvedValue(true),
      checkDeployment: jest.fn().mockResolvedValue(true),
    };
    notification = { send: jest.fn() };
    service = new ConfigService(kubectl, notification);
    service['runningConfig'] = {
      podSizeList: [],
      buildpacks: [],
      clusterissuer: 'issuer',
      notifications: [],
      kubero: {
        admin: { disabled: false },
        readonly: false,
        banner: {
          show: true,
          message: '',
          bgcolor: '',
          fontcolor: '',
        },
        console: { enabled: true },
      },
      templates: {
        enabled: true,
        catalogs: [
          {
            name: 'default',
            description: 'Default catalog',
            index: {
              url: 'https://example.com',
              format: 'json',
            },
          },
        ],
      },
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /*
  it('should update settings', async () => {
    process.env.NODE_ENV = 'development';
    const config = { settings: { kubero: { config: {} } }, secrets: {} };
    kubectl.getKuberoConfig.mockResolvedValueOnce({ spec: { kubero: { config: {} } } });
    const result = await service.updateSettings(config);
    expect(kubectl.updateKuberoConfig).toHaveBeenCalled();
    expect(kubectl.updateKuberoSecret).toHaveBeenCalled();
    expect(notification.send).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
  */

  it('should get default registry', async () => {
    const result = await service.getDefaultRegistry();
    expect(result).toBeDefined();
    expect(result.host).toBe('registry');
  });

  it('should get banner', () => {
    const result = service.getBanner();
    expect(result).toHaveProperty('show');
  });

  /*
  it('should check admin disabled', () => {
    service['runningConfig'].kubero.admin.disabled = true;
    expect(service.checkAdminDisabled()).toBe(true);
    service['runningConfig'].kubero.admin.disabled = false;
    expect(service.checkAdminDisabled()).toBe(false);
  });
  */

  it('should validate kubeconfig if setup enabled', async () => {
    process.env.KUBERO_SETUP = 'enabled';
    const result = await service.validateKubeconfig('kube', 'ctx');
    expect(result).toEqual({ valid: true });
  });

  it('should return error if setup is disabled in validateKubeconfig', async () => {
    process.env.KUBERO_SETUP = 'disabled';
    const result = await service.validateKubeconfig('kube', 'ctx');
    expect(result.status).toBe('error');
  });

  it('should update running config if setup enabled', async () => {
    process.env.KUBERO_SETUP = 'enabled';
    const result = await service.updateRunningConfig(
      'kube',
      'ctx',
      'ns',
      'key',
      'secret',
    );
    expect(result.status).toBe('ok');
    expect(kubectl.updateKubectlConfig).toHaveBeenCalled();
    expect(kubectl.createNamespace).toHaveBeenCalled();
  });

  it('should return error if setup is disabled in updateRunningConfig', async () => {
    process.env.KUBERO_SETUP = 'disabled';
    const result = await service.updateRunningConfig(
      'kube',
      'ctx',
      'ns',
      'key',
      'secret',
    );
    expect(result.status).toBe('error');
  });

  it('should check operator component', async () => {
    const result = await service.checkComponent('operator');
    expect(result.status).toBe('ok');
  });

  it('should check metrics component', async () => {
    const result = await service.checkComponent('metrics');
    expect(result.status).toBe('ok');
  });

  it('should check debug component', async () => {
    const result = await service.checkComponent('debug');
    expect(result.status).toBe('ok');
  });

  it('should check ingress component', async () => {
    const result = await service.checkComponent('ingress');
    expect(result.status).toBe('ok');
  });

  it('should get buildpipeline enabled', () => {
    process.env.KUBERO_BUILD_REGISTRY = 'true';
    expect(service.getBuildpipelineEnabled()).toBe(true);
    delete process.env.KUBERO_BUILD_REGISTRY;
  });

  it('should get template enabled', () => {
    expect(service.getTemplateEnabled()).toBe(false);
  });

  /*
  it('should get template config', async () => {
    const result = await service.getTemplateConfig();
    expect(result).toBeDefined();
  });
  */

  it('should get console enabled', () => {
    expect(service.getConsoleEnabled()).toBe(false);
  });

  it('should set and get metrics status', () => {
    service.setMetricsStatus(true);
    expect(service.getMetricsEnabled()).toBe(true);
  });

  it('should check metrics enabled', () => {
    expect(service.checkMetricsEnabled()).toBe(true);
  });

  it('should get sleep enabled', () => {
    service['features'].sleep = true;
    expect(service.getSleepEnabled()).toBe(true);
  });

  it('should get registry', async () => {
    const result = await service.getRegistry();
    expect(result).toBeDefined();
    expect(result.host).toBe('registry');
  });

  /*
  it('should get runpacks', async () => {
    kubectl.getKuberoConfig.mockResolvedValueOnce({
      spec: {
        kubero: { config: { buildpacks: [{ name: 'bp' }] } },
      },
    });
    const result = await service.getRunpacks();
    expect(Array.isArray(result)).toBe(true);
  });
  */

  it('should get cluster issuer', () => {
    const result = service.getClusterIssuer();
    expect(result.clusterissuer).toBe('letsencrypt-prod');
  });

  /*
  it('should get pod sizes', async () => {
    kubectl.getKuberoConfig.mockResolvedValueOnce({
      spec: {
        kubero: { config: { podSizeList: [{ name: 'small' }] } },
      },
    });
    const result = await service.getPodSizes();
    expect(Array.isArray(result)).toBe(true);
  });
*/

  it('should getLocalauthEnabled', () => {
    process.env.KUBERO_SESSION_KEY = 'key';
    expect(ConfigService.getLocalauthEnabled()).toBe(true);
    delete process.env.KUBERO_SESSION_KEY;
  });

  it('should getGithubEnabled', () => {
    process.env.GITHUB_CLIENT_SECRET = 'secret';
    process.env.GITHUB_CLIENT_ID = 'id';
    process.env.GITHUB_CLIENT_CALLBACKURL = 'cb';
    process.env.GITHUB_CLIENT_ORG = 'org';
    expect(ConfigService.getGithubEnabled()).toBe(true);
    delete process.env.GITHUB_CLIENT_SECRET;
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_CALLBACKURL;
    delete process.env.GITHUB_CLIENT_ORG;
  });

  it('should getOauth2Enabled', () => {
    process.env.OAUTH2_CLIENT_AUTH_URL = 'auth';
    process.env.OAUTH2_CLIENT_TOKEN_URL = 'token';
    process.env.OAUTH2_CLIENT_ID = 'id';
    process.env.OAUTH2_CLIENT_SECRET = 'secret';
    process.env.OAUTH2_CLIENT_CALLBACKURL = 'cb';
    expect(ConfigService.getOauth2Enabled()).toBe(true);
    delete process.env.OAUTH2_CLIENT_AUTH_URL;
    delete process.env.OAUTH2_CLIENT_TOKEN_URL;
    delete process.env.OAUTH2_CLIENT_ID;
    delete process.env.OAUTH2_CLIENT_SECRET;
    delete process.env.OAUTH2_CLIENT_CALLBACKURL;
  });

  it('should getAuthenticationScope', () => {
    expect(ConfigService.getAuthenticationScope('openid email')).toEqual([
      'openid',
      'email',
    ]);
    expect(ConfigService.getAuthenticationScope(undefined)).toEqual([]);
  });

  it('should getKuberoUIVersion', () => {
    process.env.npm_package_version = '1.2.3';
    expect(service.getKuberoUIVersion()).toBe('1.2.3');
    delete process.env.npm_package_version;
    expect(service.getKuberoUIVersion()).toBe('0.0.0');
  });

  describe('getRunpacks', () => {
    it('should return all runpacks from database', async () => {
      const mockDbRunpacks = [
        {
          id: '1',
          name: 'nodejs',
          language: 'javascript',
          fetch: {
            id: 'fetch1',
            repository: 'kubero/fetch',
            tag: 'latest',
            command: 'fetch-cmd',
            readOnlyAppStorage: true,
            securityContext: {
              runAsUser: 1000,
              runAsGroup: 1000,
              allowPrivilegeEscalation: false,
              readOnlyRootFilesystem: true,
              runAsNonRoot: true,
              capabilities: { add: [], drop: [] },
            },
          },
          build: {
            id: 'build1',
            repository: 'kubero/build',
            tag: 'latest',
            command: 'build-cmd',
            readOnlyAppStorage: true,
            securityContext: {
              runAsUser: 1000,
              runAsGroup: 1000,
              allowPrivilegeEscalation: false,
              readOnlyRootFilesystem: true,
              runAsNonRoot: true,
              capabilities: { add: [], drop: [] },
            },
          },
          run: {
            id: 'run1',
            repository: 'kubero/run',
            tag: 'latest',
            command: 'run-cmd',
            readOnlyAppStorage: false,
            securityContext: {
              runAsUser: 1000,
              runAsGroup: 1000,
              allowPrivilegeEscalation: false,
              readOnlyRootFilesystem: false,
              runAsNonRoot: true,
              capabilities: { add: [], drop: [] },
            },
          },
        },
      ];

      mockPrismaClient.runpack.findMany.mockResolvedValue(mockDbRunpacks);

      const result = await service.getRunpacks();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Runpack);
      expect(result[0].name).toBe('nodejs');
      expect(result[0].language).toBe('javascript');
      expect(mockPrismaClient.runpack.findMany).toHaveBeenCalledWith({
        include: { fetch: true, build: true, run: true },
      });
    });

    it('should return empty array when no runpacks exist', async () => {
      mockPrismaClient.runpack.findMany.mockResolvedValue([]);

      const result = await service.getRunpacks();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockPrismaClient.runpack.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getRunpacks()).rejects.toThrow('Database error');
    });
  });

  describe('getPodSizes', () => {
    it('should return all pod sizes from database', async () => {
      const mockDbPodSizes = [
        {
          id: '1',
          name: 'small',
          description: 'Small pod size',
          memoryRequest: '128Mi',
          cpuRequest: '100m',
          memoryLimit: '256Mi',
          cpuLimit: '200m',
        },
        {
          id: '2',
          name: 'medium',
          description: 'Medium pod size',
          memoryRequest: '256Mi',
          cpuRequest: '200m',
          memoryLimit: '512Mi',
          cpuLimit: '400m',
        },
      ];

      mockPrismaClient.podSize.findMany.mockResolvedValue(mockDbPodSizes);

      const result = await service.getPodSizes();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(PodSize);
      expect(result[0].name).toBe('small');
      expect(result[0].description).toBe('Small pod size');
      expect(result[0].resources.requests?.memory).toBe('128Mi');
      expect(result[0].resources.limits?.memory).toBe('256Mi');
      expect(result[1].name).toBe('medium');
    });

    it('should return empty array when no pod sizes exist', async () => {
      mockPrismaClient.podSize.findMany.mockResolvedValue([]);

      const result = await service.getPodSizes();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockPrismaClient.podSize.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getPodSizes()).rejects.toThrow('Database error');
    });
  });

  describe('createRunpack', () => {
    it('should create a new runpack successfully', async () => {
      const mockRunpackInput = {
        name: 'python',
        language: 'python',
        fetch: {
          repository: 'kubero/fetch-python',
          tag: 'latest',
          command: 'fetch-python-cmd',
          readOnlyAppStorage: true,
          securityContext: {
            runAsUser: 1000,
            runAsGroup: 1000,
            allowPrivilegeEscalation: false,
            readOnlyRootFilesystem: true,
            runAsNonRoot: true,
            capabilities: { add: [], drop: ['ALL'] },
          },
        },
        build: {
          repository: 'kubero/build-python',
          tag: 'latest',
          command: 'build-python-cmd',
          readOnlyAppStorage: true,
          securityContext: {
            runAsUser: 1000,
            runAsGroup: 1000,
            allowPrivilegeEscalation: false,
            readOnlyRootFilesystem: true,
            runAsNonRoot: true,
            capabilities: { add: [], drop: ['ALL'] },
          },
        },
        run: {
          repository: 'kubero/run-python',
          tag: 'latest',
          command: 'run-python-cmd',
          readOnlyAppStorage: false,
          securityContext: {
            runAsUser: 1000,
            runAsGroup: 1000,
            allowPrivilegeEscalation: false,
            readOnlyRootFilesystem: false,
            runAsNonRoot: true,
            capabilities: { add: [], drop: ['ALL'] },
          },
        },
      };

      const mockCreatedPhases = {
        fetch: { id: 'fetch-id' },
        build: { id: 'build-id' },
        run: { id: 'run-id' },
      };

      const mockCreatedRunpack = {
        id: 'runpack-id',
        name: 'python',
        language: 'python',
        fetch: mockCreatedPhases.fetch,
        build: mockCreatedPhases.build,
        run: mockCreatedPhases.run,
      };

      mockPrismaClient.runpackPhase.create
        .mockResolvedValueOnce(mockCreatedPhases.fetch)
        .mockResolvedValueOnce(mockCreatedPhases.build)
        .mockResolvedValueOnce(mockCreatedPhases.run);

      mockPrismaClient.capabilityAdd.createMany.mockResolvedValue({});
      mockPrismaClient.capabilityDrop.createMany.mockResolvedValue({});
      mockPrismaClient.runpack.create.mockResolvedValue(mockCreatedRunpack);

      const result = await service.createRunpack(mockRunpackInput);

      expect(result).toEqual(mockCreatedRunpack);
      expect(mockPrismaClient.runpackPhase.create).toHaveBeenCalledTimes(3);
      expect(mockPrismaClient.runpack.create).toHaveBeenCalledWith({
        data: {
          name: 'python',
          language: 'python',
          fetch: { connect: { id: 'fetch-id' } },
          build: { connect: { id: 'build-id' } },
          run: { connect: { id: 'run-id' } },
        },
        include: { fetch: true, build: true, run: true },
      });
    });
  });

  describe('addPodSize', () => {
    it('should create a new pod size successfully', async () => {
      const mockPodSize = new PodSize({
        name: 'large',
        description: 'Large pod size',
        resources: {
          requests: {
            memory: '512Mi',
            cpu: '400m',
          },
          limits: {
            memory: '1Gi',
            cpu: '800m',
          },
        },
      });

      const mockDbPodSize = {
        id: 'podsize-id',
        name: 'large',
        description: 'Large pod size',
        memoryRequest: '512Mi',
        cpuRequest: '400m',
        memoryLimit: '1Gi',
        cpuLimit: '800m',
      };

      mockPrismaClient.podSize.create.mockResolvedValue(mockDbPodSize);

      const result = await service.addPodSize(mockPodSize);

      expect(result).toBeInstanceOf(PodSize);
      expect(result.name).toBe('large');
      expect(result.description).toBe('Large pod size');
      expect(result.resources.requests?.memory).toBe('512Mi');
      expect(result.resources.limits?.memory).toBe('1Gi');

      expect(mockPrismaClient.podSize.create).toHaveBeenCalledWith({
        data: {
          name: 'large',
          description: 'Large pod size',
          memoryLimit: '1Gi',
          cpuLimit: '800m',
          memoryRequest: '512Mi',
          cpuRequest: '400m',
        },
      });
    });

    it('should handle empty resource values', async () => {
      const mockPodSize = new PodSize({
        name: 'minimal',
        description: 'Minimal pod size',
        resources: {},
      });

      const mockDbPodSize = {
        id: 'podsize-id',
        name: 'minimal',
        description: 'Minimal pod size',
        memoryRequest: '',
        cpuRequest: '',
        memoryLimit: '',
        cpuLimit: '',
      };

      mockPrismaClient.podSize.create.mockResolvedValue(mockDbPodSize);

      const result = await service.addPodSize(mockPodSize);

      expect(result).toBeInstanceOf(PodSize);
      expect(mockPrismaClient.podSize.create).toHaveBeenCalledWith({
        data: {
          name: 'minimal',
          description: 'Minimal pod size',
          memoryLimit: '',
          cpuLimit: '',
          memoryRequest: '',
          cpuRequest: '',
        },
      });
    });

    it('should handle database errors during pod size creation', async () => {
      const mockPodSize = new PodSize({
        name: 'test',
        description: 'Test pod size',
        resources: {},
      });

      mockPrismaClient.podSize.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.addPodSize(mockPodSize)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('updatePodSize', () => {
    it('should update an existing pod size successfully', async () => {
      const podSizeId = 'existing-id';
      const mockPodSize = new PodSize({
        name: 'updated-large',
        description: 'Updated large pod size',
        resources: {
          requests: {
            memory: '1Gi',
            cpu: '500m',
          },
          limits: {
            memory: '2Gi',
            cpu: '1000m',
          },
        },
      });

      const mockUpdatedDbPodSize = {
        id: podSizeId,
        name: 'updated-large',
        description: 'Updated large pod size',
        memoryRequest: '1Gi',
        cpuRequest: '500m',
        memoryLimit: '2Gi',
        cpuLimit: '1000m',
      };

      mockPrismaClient.podSize.update.mockResolvedValue(mockUpdatedDbPodSize);

      const result = await service.updatePodSize(podSizeId, mockPodSize);

      expect(result).toBeInstanceOf(PodSize);
      expect(result.name).toBe('updated-large');
      expect(result.description).toBe('Updated large pod size');
      expect(result.resources.requests?.memory).toBe('1Gi');
      expect(result.resources.limits?.memory).toBe('2Gi');

      expect(mockPrismaClient.podSize.update).toHaveBeenCalledWith({
        where: { id: podSizeId },
        data: {
          name: 'updated-large',
          description: 'Updated large pod size',
          memoryLimit: '2Gi',
          cpuLimit: '1000m',
          memoryRequest: '1Gi',
          cpuRequest: '500m',
        },
      });
    });

    it('should handle database errors during pod size update', async () => {
      const mockPodSize = new PodSize({
        name: 'test',
        description: 'Test pod size',
        resources: {},
      });

      mockPrismaClient.podSize.update.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.updatePodSize('test-id', mockPodSize),
      ).rejects.toThrow('Database error');
    });
  });

  describe('deletePodSize', () => {
    it('should delete an existing pod size successfully', async () => {
      const podSizeId = 'existing-id';
      const mockPodSize = {
        id: podSizeId,
        name: 'to-delete',
        description: 'Pod size to delete',
      };

      mockPrismaClient.podSize.findUnique.mockResolvedValue(mockPodSize);
      mockPrismaClient.podSize.delete.mockResolvedValue(mockPodSize);

      await service.deletePodSize(podSizeId);

      expect(mockPrismaClient.podSize.findUnique).toHaveBeenCalledWith({
        where: { id: podSizeId },
      });
      expect(mockPrismaClient.podSize.delete).toHaveBeenCalledWith({
        where: { id: podSizeId },
      });
    });

    it('should throw error when pod size not found', async () => {
      const podSizeId = 'non-existing-id';

      mockPrismaClient.podSize.findUnique.mockResolvedValue(null);

      await expect(service.deletePodSize(podSizeId)).rejects.toThrow(
        `PodSize with id ${podSizeId} not found`,
      );

      expect(mockPrismaClient.podSize.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors during pod size deletion', async () => {
      const podSizeId = 'existing-id';
      const mockPodSize = { id: podSizeId, name: 'test' };

      mockPrismaClient.podSize.findUnique.mockResolvedValue(mockPodSize);
      mockPrismaClient.podSize.delete.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.deletePodSize(podSizeId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('deleteRunpack', () => {
    it('should delete an existing runpack successfully', async () => {
      const runpackId = 'existing-runpack-id';
      const mockRunpack = {
        id: runpackId,
        name: 'nodejs-to-delete',
      };

      mockPrismaClient.runpack.findUnique.mockResolvedValue(mockRunpack);
      mockPrismaClient.runpack.delete.mockResolvedValue(mockRunpack);

      await service.deleteRunpack(runpackId);

      expect(mockPrismaClient.runpack.findUnique).toHaveBeenCalledWith({
        where: { id: runpackId },
      });
      expect(mockPrismaClient.runpack.delete).toHaveBeenCalledWith({
        where: { id: runpackId },
      });
      expect(notification.send).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'deleteRunpack',
          action: 'delete',
          message: 'Runpack nodejs-to-delete deleted',
          data: {
            runpackId,
            runpackName: 'nodejs-to-delete',
          },
        }),
      );
    });

    it('should throw error when runpack not found', async () => {
      const runpackId = 'non-existing-runpack-id';

      mockPrismaClient.runpack.findUnique.mockResolvedValue(null);

      await expect(service.deleteRunpack(runpackId)).rejects.toThrow(
        `Runpack with id ${runpackId} not found`,
      );

      expect(mockPrismaClient.runpack.delete).not.toHaveBeenCalled();
      expect(notification.send).not.toHaveBeenCalled();
    });

    it('should handle database errors during runpack deletion', async () => {
      const runpackId = 'existing-runpack-id';
      const mockRunpack = { id: runpackId, name: 'test-runpack' };

      mockPrismaClient.runpack.findUnique.mockResolvedValue(mockRunpack);
      mockPrismaClient.runpack.delete.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.deleteRunpack(runpackId)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
