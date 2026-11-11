import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class SecurityService {
  private logger = new Logger(SecurityService.name);

  constructor(
    private kubectl: KubernetesService,
    private pipelinesService: PipelinesService,
    private appsService: AppsService,
  ) {}

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
    const summary = {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      unknown: 0,
      fixable: 0,
      nofix: 0,
      ignored: 0,
    };

    if (!logs || !logs.Results) {
      this.logger.error(logs);
      this.logger.error('no logs found or not able to parse results');
      return summary;
    }

    logs.Results.forEach((target: any) => {
      if (target.Vulnerabilities) {
        target.Vulnerabilities.forEach((vuln: any) => {
          if (vuln.Ignored) {
            summary.ignored++;
            return;
          }
          summary.total++;
          if (vuln.FixedVersion) {
            summary.fixable++;
          } else {
            summary.nofix++;
          }
          switch (vuln.Severity) {
            case 'CRITICAL':
              summary.critical++;
              break;
            case 'HIGH':
              summary.high++;
              break;
            case 'MEDIUM':
              summary.medium++;
              break;
            case 'LOW':
              summary.low++;
              break;
            case 'UNKNOWN':
              summary.unknown++;
              break;
            default:
              summary.unknown++;
          }
        });
      }
    });

    return summary;
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
