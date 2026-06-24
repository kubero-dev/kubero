import { Injectable, Logger } from '@nestjs/common';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { IKubectlApp } from '../kubernetes/kubernetes.interface';
import { PipelinesService } from '../pipelines/pipelines.service';
import { AppsService } from '../apps/apps.service';

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
    const contextName = await this.pipelinesService.getContext(
      pipeline,
      phase,
      userGroups,
    );
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

    const appresult = await this.appsService.getApp(
      pipeline,
      phase,
      appName,
      userGroups,
    );

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
    };

    if (!logs || !logs.Results) {
      this.logger.error(logs);
      this.logger.error('no logs found or not able to parse results');
      return summary;
    }

    logs.Results.forEach((target: any) => {
      if (target.Vulnerabilities) {
        target.Vulnerabilities.forEach((vuln: any) => {
          summary.total++;
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

  public async startScan(
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
    const namespace = pipeline + '-' + phase;

    const appresult = await this.appsService.getApp(
      pipeline,
      phase,
      appName,
      userGroups,
    );

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
