import { V1Container, V1Pod } from '@kubernetes/client-node';

export type PodIssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface PodSecurityIssue {
  id: string;
  severity: PodIssueSeverity;
  message: string;
  container?: string;
}

export interface PodSecurity {
  severity: PodIssueSeverity | 'ok';
  issues: PodSecurityIssue[];
}

const RANK: Record<PodIssueSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function imageTag(image: string): string | undefined {
  if (image.includes('@sha256:')) {
    return 'digest';
  }
  const last = image.split('/').pop() || '';
  const idx = last.indexOf(':');
  return idx === -1 ? undefined : last.slice(idx + 1);
}

function containerIssues(
  pod: V1Pod,
  c: V1Container,
  out: PodSecurityIssue[],
): void {
  const sc = c.securityContext;
  const psc = pod.spec?.securityContext;
  const add = (id: string, severity: PodIssueSeverity, message: string) =>
    out.push({ id, severity, message, container: c.name });

  if (sc?.privileged) {
    add('privileged', 'critical', 'Container runs privileged');
  }
  if (sc?.allowPrivilegeEscalation !== false) {
    add('privilege-escalation', 'medium', 'Privilege escalation is allowed');
  }
  const runAsUser = sc?.runAsUser ?? psc?.runAsUser;
  const runAsNonRoot = sc?.runAsNonRoot ?? psc?.runAsNonRoot;
  if (runAsUser === 0) {
    add('root-user', 'high', 'Container runs as root (UID 0)');
  } else if (runAsNonRoot !== true && runAsUser === undefined) {
    add('may-run-as-root', 'medium', 'Container may run as root');
  }
  const added = sc?.capabilities?.add || [];
  if (added.some((cap) => ['SYS_ADMIN', 'NET_ADMIN', 'ALL'].includes(cap))) {
    add('capabilities', 'high', 'Container adds dangerous capabilities');
  }
  if (sc?.readOnlyRootFilesystem !== true) {
    add('writable-rootfs', 'low', 'Root filesystem is writable');
  }
  if (!c.resources?.limits?.memory && !c.resources?.limits?.cpu) {
    add('no-limits', 'low', 'No CPU or memory limits');
  }
  const tag = imageTag(c.image || '');
  if (tag === undefined || tag === 'latest') {
    add('mutable-tag', 'low', 'Image tag is not pinned');
  }
}

export function assessPod(pod: V1Pod): PodSecurity {
  const issues: PodSecurityIssue[] = [];
  const spec = pod.spec;

  if (spec?.hostNetwork) {
    issues.push({ id: 'host-network', severity: 'high', message: 'Pod uses the host network' });
  }
  if (spec?.hostPID) {
    issues.push({ id: 'host-pid', severity: 'high', message: 'Pod shares the host PID namespace' });
  }
  if (spec?.hostIPC) {
    issues.push({ id: 'host-ipc', severity: 'high', message: 'Pod shares the host IPC namespace' });
  }
  for (const v of spec?.volumes || []) {
    if (v.hostPath) {
      issues.push({
        id: 'host-path',
        severity: 'high',
        message: `Volume ${v.name} mounts a host path`,
      });
    }
  }
  for (const c of spec?.containers || []) {
    containerIssues(pod, c, issues);
  }

  issues.sort((a, b) => RANK[b.severity] - RANK[a.severity]);
  return {
    severity: issues.length ? issues[0].severity : 'ok',
    issues,
  };
}
