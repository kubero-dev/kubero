import { Buildpack } from './buildpack';
import { IBuildpack, ISecurityContext } from '../config.interface';

describe('Buildpack', () => {
  const mockSecurityContext: ISecurityContext = {
    runAsUser: 1000,
    runAsGroup: 1000,
    allowPrivilegeEscalation: true,
    readOnlyRootFilesystem: true,
    runAsNonRoot: true,
    capabilities: {
      add: ['NET_ADMIN'],
      drop: ['ALL'],
    },
  };

  const mockBuildpack: IBuildpack = {
    name: 'test',
    language: 'node',
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

  it('should create an instance', () => {
    const bp = new Buildpack(mockBuildpack);
    expect(bp).toBeInstanceOf(Buildpack);
    expect(bp.name).toBe('test');
    expect(bp.language).toBe('node');
    expect(bp.fetch.repository).toBe('repo-fetch');
    expect(bp.build.repository).toBe('repo-build');
    expect(bp.run.repository).toBe('repo-run');
    expect(bp.tag).toBe('v1');
  });

  it('should set default security context if undefined', () => {
    const bpWithUndefinedSec: IBuildpack = {
      ...mockBuildpack,
      fetch: { ...mockBuildpack.fetch, securityContext: undefined as any },
      build: { ...mockBuildpack.build, securityContext: undefined as any },
      run: { ...mockBuildpack.run, securityContext: undefined as any },
    };
    const bp = new Buildpack(bpWithUndefinedSec);
    expect(bp.fetch.securityContext.runAsUser).toBe(0);
    expect(bp.build.securityContext.allowPrivilegeEscalation).toBe(false);
    expect(bp.run.securityContext.capabilities.add).toEqual([]);
  });

  it('SetSecurityContext should fill missing properties with defaults', () => {
    const partialSec: Partial<ISecurityContext> = {
      runAsUser: 42,
      capabilities: { add: [], drop: [] },
    };
    const sec = Buildpack.SetSecurityContext(partialSec);
    expect(sec.runAsUser).toBe(42);
    expect(sec.runAsGroup).toBe(0);
    expect(sec.allowPrivilegeEscalation).toBe(false);
    expect(sec.capabilities.add).toEqual([]);
    expect(sec.capabilities.drop).toEqual([]);
  });
});