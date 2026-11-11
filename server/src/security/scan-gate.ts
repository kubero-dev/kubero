import { createHash } from 'crypto';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { applyIgnores, parseIgnores } from './vuln-ignore';
import { asReport, summarizeVulns, VulnSummary } from './scan-history';
import { parsePolicy, violates, VulnPolicy } from './vuln-policy';

export const POLICY_KEY = 'policy';
export const policyMapName = (app: string) => app + '-kuberoapp-vuln-policy';
export const ignoreMapName = (app: string) => app + '-kuberoapp-vuln-ignore';

export type GateStatus = 'off' | 'pass' | 'blocked' | 'scanning' | 'error';

export interface GateResult {
  status: GateStatus;
  message: string;
  summary?: VulnSummary;
}

export function gateJobName(app: string, image: string): string {
  const hash = createHash('sha256').update(image).digest('hex').slice(0, 8);
  return `${app.slice(0, 40)}-kuberoapp-gate-${hash}`;
}

/**
 * Decides whether an image update may go ahead. It never scans inside the request: the first
 * call starts a scan Job for the new image and answers `scanning`; later calls read its result.
 */
export class ScanGate {
  constructor(private kubectl: KubernetesService) {}

  public async policy(namespace: string, app: string): Promise<VulnPolicy> {
    try {
      return parsePolicy(
        await this.kubectl.getConfigMapValue(
          namespace,
          policyMapName(app),
          POLICY_KEY,
        ),
      );
    } catch {
      return parsePolicy(undefined);
    }
  }

  public async check(
    namespace: string,
    app: string,
    repository: string,
    tag: string,
    policy: VulnPolicy,
  ): Promise<GateResult> {
    if (policy.gate === 'off') {
      return { status: 'off', message: 'gate is off' };
    }
    const image = `${repository}:${tag}`;
    const jobName = gateJobName(app, image);
    const pod = await this.kubectl.getLatestPodByLabel(
      namespace,
      `job-name=${jobName}`,
    );

    if (!pod?.name) {
      await this.kubectl.createScanImageJob(namespace, app, repository, tag, true, {
        name: jobName,
        labels: { vulngate: app },
        annotations: { 'kubero.dev/gate-image': image },
      });
      return {
        status: 'scanning',
        message: `Scanning ${image} before the update. Try again when the scan has finished.`,
      };
    }
    if (pod.status === 'Failed') {
      return {
        status: 'error',
        message: `The scan of ${image} failed, so the update is blocked.`,
      };
    }
    if (pod.status !== 'Succeeded') {
      return {
        status: 'scanning',
        message: `The scan of ${image} is still running. Try again shortly.`,
      };
    }

    const report = asReport(
      await this.kubectl.getVulnerabilityScanLogs(namespace, pod.name),
    );
    if (!report?.Results) {
      return {
        status: 'error',
        message: `The scan report of ${image} could not be read, so the update is blocked.`,
      };
    }
    applyIgnores(
      report,
      parseIgnores(
        await this.kubectl.getConfigMapValue(
          namespace,
          ignoreMapName(app),
          'ignores',
        ),
      ),
    );
    const summary = summarizeVulns(report);
    if (violates(policy, summary)) {
      return {
        status: 'blocked',
        summary,
        message: `${image} has ${summary.fixableCritical} critical and ${summary.fixableHigh} high findings that have a fix. Update the image or ignore the findings.`,
      };
    }
    return { status: 'pass', summary, message: 'scan passed' };
  }
}
