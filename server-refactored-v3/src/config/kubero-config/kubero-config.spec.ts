import { KuberoConfig } from './kubero-config';
import { IKuberoConfig } from '../config.interface';
import { IPodSize, IBuildpack, ISecurityContext } from '../config.interface';
import { INotificationConfig } from 'src/notifications/notifications.interface';

const mockSecurityContext: ISecurityContext = {
  readOnlyRootFilesystem: false,
  allowPrivilegeEscalation: false,
  runAsUser: 1000,
  runAsGroup: 1000,
  runAsNonRoot: true,
  capabilities: {
    drop: [],
    add: [],
  },
};

const mockBuildpack: IBuildpack = {
  name: 'nodejs',
  language: 'Node.js',
  fetch: {
    repository: 'repo-fetch',
    tag: 'latest',
    readOnlyAppStorage: false,
    securityContext: mockSecurityContext,
  },
  build: {
    repository: 'repo-build',
    tag: 'latest',
    readOnlyAppStorage: false,
    securityContext: mockSecurityContext,
  },
  run: {
    repository: 'repo-run',
    tag: 'latest',
    readOnlyAppStorage: false,
    securityContext: mockSecurityContext,
  },
  tag: 'v1',
};

const mockPodSize: IPodSize = {
  name: 'small',
  description: 'Small pod',
  resources: {
    requests: { memory: '256Mi', cpu: '250m' },
    limits: { memory: '512Mi', cpu: '500m' },
  },
};

const mockNotification: INotificationConfig = {} as INotificationConfig;

const mockKuberoConfig: IKuberoConfig = {
  podSizeList: [mockPodSize],
  buildpacks: [mockBuildpack],
  clusterissuer: 'letsencrypt-prod',
  notifications: [mockNotification],
  templates: {
    enabled: true,
    catalogs: [
      {
        name: 'default',
        description: 'Default catalog',
        index: {
          url: 'https://example.com/index.yaml',
          format: 'yaml',
        },
      },
    ],
  },
  kubero: {
    console: {
      enabled: true,
    },
    admin: {
      disabled: false,
    },
    readonly: false,
    banner: {
      message: 'Welcome',
      bgcolor: '#fff',
      fontcolor: '#000',
      show: true,
    },
  },
};

describe('KuberoConfig', () => {
  it('should be defined', () => {
    expect(mockKuberoConfig).toBeDefined();
  });
});
