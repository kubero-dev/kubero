import { Template, KubectlTemplate } from './template';
import { IApp } from '../apps/apps.interface';

describe('Template', () => {
  const mockApp: IApp = {
    name: 'test-app',
    deploymentstrategy: 'git',
    envVars: [{ key: 'ENV', value: 'test' }],
    extraVolumes: [],
    cronjobs: [],
    addons: [],
    web: { replicaCount: 2, autoscaling: { minReplicas: 1, maxReplicas: 2 } },
    worker: { replicaCount: 1, autoscaling: { minReplicas: 1, maxReplicas: 1 } },
    image: {
      containerPort: 8080,
      repository: 'repo',
      tag: 'latest',
      // run: { repository: 'repo', tag: 'latest', securityContext: {} as any }
    },
    // weitere Felder falls benötigt
  } as unknown as IApp;

  it('should create a Template instance', () => {
    const template = new Template(mockApp);
    expect(template.name).toBe('test-app');
    expect(template.deploymentstrategy).toBe('git');
    expect(template.envVars.length).toBe(1);
    expect(template.web.replicaCount).toBe(2);
    expect(template.worker.replicaCount).toBe(1);
    expect(template.image.containerPort).toBe(8080);
    expect(template.image.repository).toBe('repo');
    expect(template.image.tag).toBe('latest');
    expect(template.image.pullPolicy).toBe('Always');
  });
});

describe('KubectlTemplate', () => {
  const mockApp: IApp = {
    name: 'test-app',
    deploymentstrategy: 'docker',
    envVars: [],
    extraVolumes: [],
    cronjobs: [],
    addons: [],
    web: { replicaCount: 1, autoscaling: { minReplicas: 1, maxReplicas: 1 } },
    worker: { replicaCount: 0, autoscaling: { minReplicas: 0, maxReplicas: 0 } },
    image: {
      containerPort: 80,
      repository: 'repo',
      tag: 'v1',
    },
  } as unknown as IApp;

  it('should create a KubectlTemplate instance', () => {
    const kubectlTemplate = new KubectlTemplate(mockApp);
    expect(kubectlTemplate.apiVersion).toBe('application.kubero.dev/v1alpha1');
    expect(kubectlTemplate.kind).toBe('KuberoApp');
    expect(kubectlTemplate.metadata.name).toBe('test-app');
    expect(kubectlTemplate.spec).toBeInstanceOf(Template);
  });
});