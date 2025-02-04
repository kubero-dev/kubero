import { Pipeline } from './pipeline';
import { IPipeline } from '../pipelines.interface';

describe('Pipeline', () => {
  const mockPipeline: IPipeline = {
    name: 'test-pipeline',
    domain: 'example.com',
    dockerimage: 'test-image',
    reviewapps: true,
    phases: [],
    buildpack: { 
      name: 'test-buildpack',
      language: 'nodejs',
      fetch: {
        repository: 'https://github.com/test/repo',
        tag: 'latest',
        readOnlyAppStorage: true,
        securityContext: {
          runAsUser: 1000,
          runAsGroup: 3000,
          runAsNonRoot: false,
          readOnlyRootFilesystem: false,
          allowPrivilegeEscalation: false,
          capabilities: {
            add: [],
            drop: []
          }
        }
      },
      build: {
        repository: 'https://github.com/test/repo',
        tag: 'latest',
        readOnlyAppStorage: true,
        securityContext: {
          runAsUser: 1000,
          runAsGroup: 3000,
          runAsNonRoot: false,
          readOnlyRootFilesystem: false,
          allowPrivilegeEscalation: false,
          capabilities: {
            add: [],
            drop: []
          }
        }
      },
      run: {
        repository: 'https://github.com/test/repo',
        tag: 'latest',
        readOnlyAppStorage: true,
        securityContext: {
          runAsUser: 1000,
          runAsGroup: 3000,
          runAsNonRoot: false,
          readOnlyRootFilesystem: false,
          allowPrivilegeEscalation: false,
          capabilities: {
            add: [],
            drop: []
          }
        }
      },
      tag: 'latest'
    },
    deploymentstrategy: 'git',
    buildstrategy: 'plain',
    git: {
      keys: {},
      repository: {
        admin: true,
      },
      webhook: {}

    },
    registry: { 
      host: 'test-host',
      username: 'test-user',
      password: 'test-password'
    }
  };

  it('should be defined', () => {
    expect(new Pipeline(mockPipeline)).toBeDefined();
  });

  it('should have correct properties', () => {
    const pipeline = new Pipeline(mockPipeline);
    expect(pipeline.name).toBe(mockPipeline.name);
    expect(pipeline.domain).toBe(mockPipeline.domain);
    expect(pipeline.dockerimage).toBe(mockPipeline.dockerimage);
    expect(pipeline.reviewapps).toBe(mockPipeline.reviewapps);
    expect(pipeline.phases).toBe(mockPipeline.phases);
    expect(pipeline.buildpack).toBe(mockPipeline.buildpack);
    expect(pipeline.deploymentstrategy).toBe(mockPipeline.deploymentstrategy);
    expect(pipeline.buildstrategy).toBe(mockPipeline.buildstrategy);
    expect(pipeline.git).toBe(mockPipeline.git);
    expect(pipeline.registry).toBe(mockPipeline.registry);
  });
});
