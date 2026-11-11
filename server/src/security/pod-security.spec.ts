import { V1Pod } from '@kubernetes/client-node';
import { assessPod } from './pod-security';

const hardened: V1Pod = {
  spec: {
    securityContext: { runAsNonRoot: true, runAsUser: 1000 },
    containers: [
      {
        name: 'app',
        image: 'repo/app:1.2.3',
        resources: { limits: { memory: '1Gi' } },
        securityContext: {
          allowPrivilegeEscalation: false,
          readOnlyRootFilesystem: true,
        },
      },
    ],
  },
};

describe('assessPod', () => {
  it('reports ok for a hardened pod', () => {
    expect(assessPod(hardened)).toEqual({ severity: 'ok', issues: [] });
  });

  it('flags privileged containers as critical, first', () => {
    const pod: V1Pod = {
      spec: {
        containers: [
          { name: 'app', image: 'app:latest', securityContext: { privileged: true } },
        ],
      },
    };
    const r = assessPod(pod);
    expect(r.severity).toBe('critical');
    expect(r.issues[0].id).toBe('privileged');
    expect(r.issues.map((i) => i.id)).toContain('mutable-tag');
  });

  it('flags host namespaces and host paths', () => {
    const pod: V1Pod = {
      spec: {
        hostNetwork: true,
        volumes: [{ name: 'd', hostPath: { path: '/' } }],
        containers: hardened.spec!.containers,
        securityContext: hardened.spec!.securityContext,
      },
    };
    const ids = assessPod(pod).issues.map((i) => i.id);
    expect(ids).toEqual(['host-network', 'host-path']);
  });

  it('treats a digest as pinned and UID 0 as root', () => {
    const pod: V1Pod = {
      spec: {
        containers: [
          {
            name: 'a',
            image: 'x/y@sha256:abc',
            securityContext: { runAsUser: 0, allowPrivilegeEscalation: false, readOnlyRootFilesystem: true },
            resources: { limits: { cpu: '1' } },
          },
        ],
      },
    };
    const r = assessPod(pod);
    expect(r.issues.map((i) => i.id)).toEqual(['root-user']);
  });
});
