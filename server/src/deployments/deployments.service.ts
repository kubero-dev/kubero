import { Injectable, Logger } from '@nestjs/common';
import { IKuberoBuildjob } from './deployments.interface';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { IKubectlApp } from '../kubernetes/kubernetes.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { INotification } from '../notifications/notifications.interface';
import { IUser } from '../auth/auth.interface';
import { AppsService } from '../apps/apps.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { ILoglines } from '../logs/logs.interface';
import { LogsService } from '../logs/logs.service';
import { V1JobList } from '@kubernetes/client-node';

@Injectable()
export class DeploymentsService {
  //private YAML = require('yaml');

  constructor(
    //options: DeploymentOptions
    private kubectl: KubernetesService,
    private appsService: AppsService,
    private notificationService: NotificationsService,
    private pipelinesService: PipelinesService,
    private LogsService: LogsService,
  ) {
    //this.kubectl = options.kubectl
    //this._io = options.io
    //this.notification = options.notifications
    //this.kubero = options.kubero
  }

  private logger = new Logger(DeploymentsService.name);

  public async listBuildjobs(
    pipelineName: string,
    phaseName: string,
    appName: string,
    userGroups: string[],
  ): Promise<any> {
    const namespace = pipelineName + '-' + phaseName;
    const jobs = (await this.kubectl.getJobs(namespace)) as V1JobList;
    const appresult = await this.appsService.getApp(
      pipelineName,
      phaseName,
      appName,
      userGroups,
    );

    const app = appresult as IKubectlApp;

    if (!jobs) {
      this.logger.log('No deployments found');
      return {
        items: [],
      };
    }

    const retJobs = [] as IKuberoBuildjob[];
    for (const j of jobs.items as any) {
      // skip non matching apps
      if (j.metadata.labels.kuberoapp != appName) {
        continue;
      }

      const retJob = {} as IKuberoBuildjob;
      retJob.creationTimestamp = j.metadata.creationTimestamp;
      retJob.name = j.metadata.name;
      retJob.app = j.metadata.labels.kuberoapp;
      retJob.pipeline = j.metadata.labels.kuberopipeline;
      retJob.phase = j.metadata.labels.kuberophase || '';
      retJob.buildstrategy = j.metadata.labels.buildstrategy;
      retJob.gitrepo = j.spec.template.spec.initContainers[0].env.find(
        (e: any) => e.name == 'GIT_REPOSITORY',
      ).value;
      retJob.gitref = j.spec.template.spec.initContainers[0].env.find(
        (e: any) => e.name == 'GIT_REF',
      ).value;
      retJob.image = j.spec.template.spec.containers[0].env.find(
        (e: any) => e.name == 'REPOSITORY',
      ).value;
      retJob.tag = j.spec.template.spec.containers[0].env.find(
        (e: any) => e.name == 'TAG',
      ).value;
      retJob.backoffLimit = j.spec.backoffLimit;
      retJob.status = j.status;

      if (j.status.failed) {
        retJob.state = 'Failed';
        retJob.duration =
          new Date(j.status.conditions[0].lastProbeTime).getTime() -
          new Date(j.status.startTime).getTime();
      }
      if (j.status.active) {
        retJob.state = 'Active';
        retJob.duration =
          new Date().getTime() - new Date(j.status.startTime).getTime();
      }
      if (j.status.succeeded) {
        retJob.state = 'Succeeded';
        retJob.duration =
          new Date(j.status.completionTime).getTime() -
          new Date(j.status.startTime).getTime();
      }

      retJobs.push(retJob);
    }

    return retJobs.reverse();
  }

  public async triggerBuildjob(
    pipeline: string,
    phase: string,
    app: string,
    buildstrategy: 'buildpacks' | 'dockerfile' | 'nixpacks' | 'plain',
    gitrepo: string,
    reference: string,
    dockerfilePath: string,
    user: IUser,
  ): Promise<any> {
    //this.logger.debug('triggerBuildjob: ' + pipeline + ' ' + phase + ' ' + app + ' ' + buildstrategy + ' ' + gitrepo + ' ' + reference + ' ' + dockerfilePath + ' ' + user.username);

    if (process.env.KUBERO_READONLY == 'true') {
      this.logger.log(
        'KUBERO_READONLY is set to true, not triggering build for app: ' +
          app +
          ' in pipeline: ' +
          pipeline,
      );
      return;
    }

    const namespace = pipeline + '-' + phase;

    if (process.env.KUBERO_READONLY == 'true') {
      this.logger.log('KUBERO_READONLY is set to true');
      return;
    }

    // Create the Build CRD
    try {
      await this.kubectl.createBuildJob(
        namespace,
        app,
        pipeline,
        buildstrategy,
        dockerfilePath,
        {
          ref: reference,
          url: gitrepo,
        },
        {
          image: process.env.KUBERO_BUILD_REGISTRY + '/' + pipeline + '-' + app,
          tag: reference,
        },
      );
    } catch (error) {
      this.logger.error(
        'kubectl.createBuildJob: Error creating Kubero build job',
        error,
      );
    }

    const m = {
      name: 'newBuild',
      user: user.username,
      resource: 'pipeline',
      action: 'created',
      severity: 'normal',
      message: 'Created new Build Job: ' + app + ' in pipeline: ' + pipeline,
      pipelineName: pipeline,
      phaseName: '',
      appName: '',
      data: {
        pipeline: pipeline,
      },
    } as INotification;
    this.notificationService.send(m);

    return {
      message: 'Build started',
    };
  }

  public async deleteBuildjob(
    pipeline: string,
    phase: string,
    app: string,
    buildName: string,
    user: IUser,
  ): Promise<any> {
    if (process.env.KUBERO_READONLY == 'true') {
      this.logger.log(
        'KUBERO_READONLY is set to true, not creating app: ' +
          app +
          ' in pipeline: ' +
          pipeline,
      );
      return;
    }

    const namespace = pipeline + '-' + phase;
    await this.kubectl.deleteKuberoBuildJob(namespace, buildName);

    const m = {
      name: 'newBuild',
      user: user.username,
      resource: 'build',
      action: 'deleted',
      severity: 'normal',
      message: 'Deleted Build Job: ' + app + ' in pipeline: ' + pipeline,
      pipelineName: pipeline,
      phaseName: '',
      appName: '',
      data: {
        pipeline: pipeline,
      },
    } as INotification;
    this.notificationService.send(m);

    return {
      message: 'Deployment deleted',
    };
  }

  public async getBuildLogs(
    pipelineName: string,
    phaseName: string,
    appName: string,
    buildName: string,
    containerName: string,
    userGroups: string[],
  ): Promise<any> {
    const contextName = await this.pipelinesService.getContext(
      pipelineName,
      phaseName,
      userGroups,
    );
    const namespace = pipelineName + '-' + phaseName;

    let loglines = [] as ILoglines[];

    if (contextName) {
      const pods = await this.kubectl.getPods(namespace, contextName);
      for (const pod of pods) {
        //this.logger.log('Fetching logs for pod: ', pod.metadata?.labels?.["job-name"], buildName)
        if (
          pod.metadata?.labels?.kuberoapp == appName &&
          pod.metadata.name &&
          pod.metadata?.labels?.['job-name'] == buildName
        ) {
          const ll = await this.LogsService.fetchLogs(
            namespace,
            pod.metadata.name,
            containerName,
            pipelineName,
            phaseName,
            appName,
          );
          loglines = loglines.concat(ll);
        }
      }
    }
    return loglines;
  }

  public async deployApp(
    pipelineName: string,
    phaseName: string,
    appName: string,
    tag: string,
    userGroups: string[],
  ) {
    this.logger.debug(
      'deploy App: ' + appName + ' in ' + pipelineName + ' phase: ' + phaseName,
    );

    const contextName = await this.pipelinesService.getContext(
      pipelineName,
      phaseName,
      userGroups,
    );
    const namespace = pipelineName + '-' + phaseName;

    if (contextName) {
      this.kubectl.setCurrentContext(contextName);
      this.kubectl.deployApp(namespace, appName, tag);

      const m = {
        name: 'deployApp',
        user: '',
        resource: 'app',
        action: 'deploy',
        severity: 'normal',
        message:
          'Deploy App: ' +
          appName +
          ' in ' +
          pipelineName +
          ' phase: ' +
          phaseName,
        pipelineName: pipelineName,
        phaseName: phaseName,
        appName: appName,
        data: {},
      } as INotification;
      this.notificationService.send(m);
    }
  }
}
