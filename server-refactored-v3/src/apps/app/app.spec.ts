import { App, KubectlApp } from './app';
import { Buildpack } from '../../config/buildpack/buildpack';
import { IPodSize, ISecurityContext } from '../../config/config.interface';
import { IApp } from '../apps.interface';

jest.mock('bcrypt', () => ({
  hashSync: (pass: string) => `hashed_${pass}`,
  genSaltSync: () => 'salt',
}));

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

const baseApp = {
  name: 'test-app',
  pipeline: 'test-pipeline',
  phase: 'dev',
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

describe('App', () => {
  it('should create an App instance with hashed passwords', () => {
    const app = new App(baseApp);
    expect(app.name).toBe('test-app');
    expect(app.basicAuth.accounts[0].hash).toBe('user1:hashed_pass1');
    expect(app.basicAuth.accounts[1].hash).toBe('user2:hashed_pass2');
    expect(app.image.fetch.securityContext).toBeDefined();
    expect(app.image.build.securityContext).toBeDefined();
    expect(app.image.run.securityContext).toBeDefined();
    expect(app.ingress.className).toBe('nginx');
    expect(app.healthcheck.enabled).toBe(true);
  });

  it('should set default basicAuth if not provided', () => {
    const app = new App({ ...baseApp, basicAuth: undefined as any });
    expect(app.basicAuth.enabled).toBe(false);
    expect(app.basicAuth.accounts).toEqual([]);
  });

  it('should set ingress.className from env if provided', () => {
    process.env.KUBERNETES_INGRESS_CLASSNAME = 'custom';
    const app = new App({
      ...baseApp,
      ingress: { ...baseApp.ingress, className: '' },
    });
    expect(app.ingress.className).toBe('custom');
    delete process.env.KUBERNETES_INGRESS_CLASSNAME;
  });
});

describe('KubectlApp', () => {
  it('should create a KubectlApp instance', () => {
    const app = new App(baseApp);
    const kubectlApp = new KubectlApp(app);
    expect(kubectlApp.apiVersion).toBe('application.kubero.dev/v1alpha1');
    expect(kubectlApp.kind).toBe('KuberoApp');
    expect(kubectlApp.metadata.name).toBe(app.name);
    expect(kubectlApp.spec).toBe(app);
  });
});
