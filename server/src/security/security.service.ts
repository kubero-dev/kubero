import { Injectable, Logger, Optional } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { INotification } from '../notifications/notifications.interface';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { IKubectlApp } from '../kubernetes/kubernetes.interface';
import { PipelinesService } from '../pipelines/pipelines.service';
import { AppsService } from '../apps/apps.service';
import {
  MAX_IGNORES,
  VulnIgnore,
  applyIgnores,
  isActive,
  parseIgnores,
  validateIgnore,
} from './vuln-ignore';
import {
  ScanEntry,
  VulnSummary,
  appendEntry,
  asReport,
  buildEntry,
  hasEntry,
  newBlocking,
  parseHistory,
  summarizeVulns,
} from './scan-history';
import {
  VulnPolicy,
  parsePolicy,
  rescanDue,
  validatePolicy,
} from './vuln-policy';
import { POLICY_KEY, ScanGate, policyMapName } from './scan-gate';

@Injectable()
export class SecurityService {
  private logger = new Logger(SecurityService.name);

  constructor(
    private kubectl: KubernetesService,
    private pipelinesService: PipelinesService,
    private appsService: AppsService,
    @Optional() private notificationsService?: NotificationsService,
  ) {}

  private gate = new ScanGate(this.kubectl);

  public async getScanResult(
    pipeline: string,
    phase: string,
    appName: string,
    logdetails: boolean,
    userGroups: string[],
  ) {
    const contextName = await this.pipelinesService.getContext(pipeline, phase, userGroups);
    const namespace = pipeline + '-' + phase;

    const scanResult = {
      status: 'error',
      message: 'unknown error',
      deploymentstrategy: '',
      pipeline: pipeline,
      phase: phase,
      app: appName,
      namespace: namespace,
      logsummary: {},
      logs: {},
      logPod: '',
    };

    if (!contextName) {
      scanResult.status = 'error';
      scanResult.message = 'no context found';
      return scanResult;
    }

    const appresult = await this.appsService.getApp(pipeline, phase, appName, userGroups);

    const app = appresult as IKubectlApp;

    const logPod = await this.kubectl.getLatestPodByLabel(
      namespace,
      `vulnerabilityscan=${appName}`,
    );

    if (!logPod.name) {
      scanResult.status = 'error';
      scanResult.message = 'no vulnerability scan pod found';
      return scanResult;
    }

    let logs = '';
    if (contextName) {
      this.kubectl.setCurrentContext(contextName);
      logs = await this.kubectl.getVulnerabilityScanLogs(
        namespace,
        logPod.name,
      );
    }

    if (!logs) {
      scanResult.status = 'running';
      scanResult.message = 'no vulnerability scan logs found';
      return scanResult;
    }

    const ignores = await this.loadIgnores(namespace, appName);
    applyIgnores(logs, ignores);
    const logsummary = this.getVulnSummary(logs);
    try {
      await this.recordScan(
        pipeline,
        phase,
        appName,
        logs,
        logsummary,
        logPod.startTime,
      );
    } catch (error) {
      this.logger.error(error);
    }

    scanResult.status = 'ok';
    scanResult.message = 'vulnerability scan result';
    scanResult.deploymentstrategy = app?.spec?.deploymentstrategy;
    scanResult.logsummary = logsummary;
    scanResult.logPod = logPod;

    if (logdetails) {
      scanResult.logs = logs;
    }

    return scanResult;
  }

  private getVulnSummary(logs: any) {
    if (!logs || !logs.Results) {
      this.logger.error(logs);
      this.logger.error('no logs found or not able to parse results');
    }
    return summarizeVulns(logs);
  }

  private historyMapName(appName: string): string {
    return appName + '-kuberoapp-vuln-history';
  }

  /** Stores a finished scan in the history of the app; sends a notification for new fixable findings. */
  public async recordScan(
    pipeline: string,
    phase: string,
    appName: string,
    logs: any,
    summary: VulnSummary,
    startTime: Date | string | undefined,
  ): Promise<{ recorded: boolean; fresh: string[] }> {
    if (!startTime) {
      return { recorded: false, fresh: [] };
    }
    const scannedAt = new Date(startTime).toISOString();
    const namespace = pipeline + '-' + phase;
    const name = this.historyMapName(appName);
    const history = parseHistory(
      await this.kubectl.getConfigMapValue(namespace, name, 'history'),
    ) ?? { pipeline, phase, app: appName, entries: [] };
    if (hasEntry(history.entries, scannedAt)) {
      return { recorded: false, fresh: [] };
    }
    const entry = buildEntry(logs, summary, scannedAt);
    const previous = history.entries[history.entries.length - 1];
    history.entries = appendEntry(history.entries, entry);
    await this.kubectl.setConfigMapValue(
      namespace,
      name,
      'history',
      JSON.stringify(history),
      { 'kubero.dev/vuln-history': 'true' },
    );

    const fresh = previous ? newBlocking(previous, entry) : [];
    if (fresh.length > 0 && this.notificationsService) {
      const policy = await this.gate.policy(namespace, appName);
      if (policy.notify) {
        const ids = fresh.map((f) => f.split('|')[0]);
        const shown = ids.slice(0, 5).join(', ');
        const more = ids.length > 5 ? ` and ${ids.length - 5} more` : '';
        this.notificationsService.send({
          name: 'vulnerabilityScan',
          user: '',
          resource: 'security',
          action: 'scan',
          severity: summary.fixableCritical > 0 ? 'critical' : 'warning',
          message: `New critical or high vulnerabilities with a fix in ${appName}: ${shown}${more}`,
          phaseName: phase,
          pipelineName: pipeline,
          appName,
          data: { findings: fresh },
        } as INotification);
      }
    }
    return { recorded: true, fresh };
  }

  public async getHistory(
    pipeline: string,
    phase: string,
    appName: string,
    userGroups: string[],
  ): Promise<ScanEntry[]> {
    const contextName = await this.pipelinesService.getContext(
      pipeline,
      phase,
      userGroups,
    );
    if (!contextName) {
      return [];
    }
    this.kubectl.setCurrentContext(contextName);
    return (
      parseHistory(
        await this.kubectl.getConfigMapValue(
          pipeline + '-' + phase,
          this.historyMapName(appName),
          'history',
        ),
      )?.entries ?? []
    );
  }

  public async getPolicy(
    pipeline: string,
    phase: string,
    appName: string,
    userGroups: string[],
  ): Promise<VulnPolicy> {
    const contextName = await this.pipelinesService.getContext(
      pipeline,
      phase,
      userGroups,
    );
    if (!contextName) {
      return parsePolicy(undefined);
    }
    this.kubectl.setCurrentContext(contextName);
    return this.gate.policy(pipeline + '-' + phase, appName);
  }

  public async setPolicy(
    pipeline: string,
    phase: string,
    appName: string,
    input: any,
    userGroups: string[],
  ): Promise<VulnPolicy> {
    const policy = validatePolicy(input);
    const contextName = await this.pipelinesService.getContext(
      pipeline,
      phase,
      userGroups,
    );
    if (!contextName) {
      throw new Error('no context found');
    }
    this.kubectl.setCurrentContext(contextName);
    await this.kubectl.setConfigMapValue(
      pipeline + '-' + phase,
      policyMapName(appName),
      POLICY_KEY,
      JSON.stringify(policy),
    );
    return policy;
  }

  /** The newest scan of every app that has a history, worst first. */
  public async getOverview(userGroups: string[]) {
    const pipelines = await this.pipelinesService.listPipelines(userGroups);
    const rows: any[] = [];
    for (const p of pipelines.items) {
      for (const phase of p.phases || []) {
        if (!phase.enabled) {
          continue;
        }
        this.kubectl.setCurrentContext(phase.context);
        const values = await this.kubectl.listConfigMapValues(
          p.name + '-' + phase.name,
          'kubero.dev/vuln-history=true',
          'history',
        );
        for (const raw of values) {
          const h = parseHistory(raw);
          const last = h?.entries[h.entries.length - 1];
          if (h && last) {
            rows.push({
              pipeline: p.name,
              phase: phase.name,
              app: h.app,
              scannedAt: last.scannedAt,
              target: last.target,
              summary: last.summary,
              scans: h.entries.length,
            });
          }
        }
      }
    }
    return rows.sort(
      (a, b) =>
        b.summary.fixableCritical - a.summary.fixableCritical ||
        b.summary.critical - a.summary.critical ||
        b.summary.fixableHigh - a.summary.fixableHigh ||
        b.summary.high - a.summary.high,
    );
  }

  /** Records finished scans of every app and starts the scans that a policy marks as due. */
  public async refreshAll(userGroups: string[]): Promise<void> {
    const pipelines = await this.pipelinesService.listPipelines(userGroups);
    for (const p of pipelines.items) {
      for (const phase of p.phases || []) {
        if (!phase.enabled) {
          continue;
        }
        const namespace = p.name + '-' + phase.name;
        this.kubectl.setCurrentContext(phase.context);
        const apps = await this.kubectl.getAppsList(namespace, phase.context);
        for (const item of apps.items || []) {
          try {
            await this.refreshApp(p.name, phase.name, item.spec.name, phase.context, userGroups);
          } catch (error) {
            this.logger.error(error);
          }
        }
      }
    }
  }

  private async refreshApp(
    pipeline: string,
    phase: string,
    appName: string,
    context: string,
    userGroups: string[],
  ): Promise<void> {
    const namespace = pipeline + '-' + phase;
    this.kubectl.setCurrentContext(context);
    const pod = await this.kubectl.getLatestPodByLabel(
      namespace,
      `vulnerabilityscan=${appName}`,
    );
    if (pod?.name && pod.status === 'Succeeded') {
      const logs = asReport(
        await this.kubectl.getVulnerabilityScanLogs(namespace, pod.name),
      );
      if (logs?.Results) {
        applyIgnores(logs, await this.loadIgnores(namespace, appName));
        await this.recordScan(
          pipeline,
          phase,
          appName,
          logs,
          summarizeVulns(logs),
          pod.startTime,
        );
      }
    }
    const policy = await this.gate.policy(namespace, appName);
    if (policy.rescanDays > 0) {
      const entries = parseHistory(
        await this.kubectl.getConfigMapValue(
          namespace,
          this.historyMapName(appName),
          'history',
        ),
      )?.entries;
      if (rescanDue(policy, entries?.[entries.length - 1]?.scannedAt)) {
        await this.startScan(pipeline, phase, appName, userGroups);
      }
    }
  }

  private ignoreMapName(appName: string): string {
    return appName + '-kuberoapp-vuln-ignore';
  }

  private async loadIgnores(
    namespace: string,
    appName: string,
  ): Promise<VulnIgnore[]> {
    return parseIgnores(
      await this.kubectl.getConfigMapValue(
        namespace,
        this.ignoreMapName(appName),
        'ignores',
      ),
    );
  }

  public async getIgnores(
    pipeline: string,
    phase: string,
    appName: string,
    userGroups: string[],
  ) {
    const contextName = await this.pipelinesService.getContext(
      pipeline,
      phase,
      userGroups,
    );
    if (!contextName) {
      return [];
    }
    this.kubectl.setCurrentContext(contextName);
    return this.loadIgnores(pipeline + '-' + phase, appName);
  }

  public async addIgnore(
    pipeline: string,
    phase: string,
    appName: string,
    input: any,
    userGroups: string[],
  ) {
    const entry = validateIgnore(input);
    const contextName = await this.pipelinesService.getContext(
      pipeline,
      phase,
      userGroups,
    );
    if (!contextName) {
      throw new Error('no context found');
    }
    this.kubectl.setCurrentContext(contextName);
    const namespace = pipeline + '-' + phase;
    const current = (await this.loadIgnores(namespace, appName)).filter(
      (e) => isActive(e) && !(e.id === entry.id && e.pkg === entry.pkg),
    );
    if (current.length >= MAX_IGNORES) {
      throw new Error('too many ignore entries');
    }
    current.push(entry);
    await this.kubectl.setConfigMapValue(
      namespace,
      this.ignoreMapName(appName),
      'ignores',
      JSON.stringify(current),
    );
    return current;
  }

  public async removeIgnore(
    pipeline: string,
    phase: string,
    appName: string,
    id: string,
    pkg: string | undefined,
    userGroups: string[],
  ) {
    const contextName = await this.pipelinesService.getContext(
      pipeline,
      phase,
      userGroups,
    );
    if (!contextName) {
      throw new Error('no context found');
    }
    this.kubectl.setCurrentContext(contextName);
    const namespace = pipeline + '-' + phase;
    const next = (await this.loadIgnores(namespace, appName)).filter(
      (e) => !(e.id === id && (e.pkg || undefined) === (pkg || undefined)),
    );
    await this.kubectl.setConfigMapValue(
      namespace,
      this.ignoreMapName(appName),
      'ignores',
      JSON.stringify(next),
    );
    return next;
  }

  public async startScan(pipeline: string, phase: string, appName: string, userGroups: string[]) {
    const contextName = await this.pipelinesService.getContext(pipeline, phase, userGroups);
    const namespace = pipeline + '-' + phase;

    const appresult = await this.appsService.getApp(pipeline, phase, appName, userGroups);

    const app = appresult as IKubectlApp;

    if (
      app?.spec?.deploymentstrategy === 'git' &&
      app?.spec?.buildstrategy === 'plain'
    ) {
      //if (app?.spec?.deploymentstrategy === 'git') {

      if (app?.spec.gitrepo?.clone_url) {
        if (contextName) {
          this.kubectl.setCurrentContext(contextName);
          this.kubectl.createScanRepoJob(
            namespace,
            appName,
            app.spec.gitrepo.clone_url,
            app.spec.branch,
          );
        }
      } else {
        this.logger.debug('no git repo found to run scan');
      }
    } else if (
      app?.spec?.deploymentstrategy === 'git' &&
      app?.spec?.buildstrategy != 'plain'
    ) {
      if (contextName) {
        this.kubectl.setCurrentContext(contextName);
        this.kubectl.createScanImageJob(
          namespace,
          appName,
          app.spec.image.repository,
          app.spec.image.tag,
          true,
        );
      }
    } else {
      if (contextName) {
        this.kubectl.setCurrentContext(contextName);
        this.kubectl.createScanImageJob(
          namespace,
          appName,
          app.spec.image.repository,
          app.spec.image.tag,
          false,
        );
      }
    }

    return {
      status: 'ok',
      message: 'scan started',
      deploymentstrategy: app?.spec?.deploymentstrategy,
      pipeline: pipeline,
      phase: phase,
      app: appName,
    };
  }
}
