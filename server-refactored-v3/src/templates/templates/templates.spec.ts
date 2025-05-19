import { KubectlTemplate } from './templates';
import { IApp } from '../../apps/apps.interface';

describe('KubectlTemplate', () => {
  const mockApp: IApp = {
    name: 'test-app',
    deploymentstrategy: 'git',
    envVars: [{ key: 'ENV', value: 'prod' }],
    extraVolumes: [],
    cronjobs: [],
    addons: [],
    web: { replicaCount: 2 },
    worker: { replicaCount: 1 },
    image: {
      containerPort: 8080,
      repository: 'test-repo',
      tag: 'v2',
    },
  } as any;

  it('should create a KubectlTemplate with correct apiVersion and kind', () => {
    const tpl = new KubectlTemplate(mockApp);
    expect(tpl.apiVersion).toBe('application.kubero.dev/v1alpha1');
    expect(tpl.kind).toBe('KuberoApp');
  });

  it('should set metadata name and labels', () => {
    const tpl = new KubectlTemplate(mockApp);
    expect(tpl.metadata.name).toBe('test-app');
    expect(tpl.metadata.labels).toBeDefined();
    expect(tpl.metadata.labels?.manager).toBe('kubero');
  });

  it('should set spec properties from app', () => {
    const tpl = new KubectlTemplate(mockApp);
    expect(tpl.spec.name).toBe('test-app');
    expect(tpl.spec.deploymentstrategy).toBe('git');
    expect(tpl.spec.envVars).toEqual([{ key: 'ENV', value: 'prod' }]);
    expect(tpl.spec.web.replicaCount).toBe(2);
    expect(tpl.spec.worker.replicaCount).toBe(1);
    expect(tpl.spec.image.containerPort).toBe(8080);
    expect(tpl.spec.image.repository).toBe('test-repo');
    expect(tpl.spec.image.tag).toBe('v2');
    expect(tpl.spec.image.pullPolicy).toBe('Always');
  });

  it('should use default image repository and tag if not provided', () => {
    const app = { ...mockApp, image: { containerPort: 80 } } as any;
    const tpl = new KubectlTemplate(app);
    expect(tpl.spec.image.repository).toBe('ghcr.io/kubero-dev/idler');
    expect(tpl.spec.image.tag).toBe('v1');
  });
});
