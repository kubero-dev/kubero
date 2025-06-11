import { ConfigService } from './config.service';

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

  it('should get banner', async () => {
    const result = await service.getBanner();
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

  it('should update running config if setup enabled', () => {
    process.env.KUBERO_SETUP = 'enabled';
    const result = service.updateRunningConfig(
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

  it('should return error if setup is disabled in updateRunningConfig', () => {
    process.env.KUBERO_SETUP = 'disabled';
    const result = service.updateRunningConfig(
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

  it('should get cluster issuer', async () => {
    kubectl.getKuberoConfig.mockResolvedValueOnce({
      spec: {
        kubero: { config: { clusterissuer: 'issuer' } },
      },
    });
    const result = await service.getClusterIssuer();
    expect(result.clusterissuer).toBe('issuer');
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
});
