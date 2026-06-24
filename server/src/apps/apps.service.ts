import { Injectable, Logger } from '@nestjs/common';
import { PipelinesService } from '../pipelines/pipelines.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { NotificationsService } from '../notifications/notifications.service';
import { IKubectlApp } from '../kubernetes/kubernetes.interface';
import { INotification } from '../notifications/notifications.interface';
import { App } from './app/app';
import { IApp, Workload, WorkloadContainer } from './apps.interface';
import { IUser } from '../auth/auth.interface';
import { ConfigService } from '../config/config.service';
import { KubectlTemplate } from '../templates/template';
import { Stream } from 'stream';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class AppsService {
  private logger = new Logger(AppsService.name);
  private YAML = require('yaml');

  constructor(
    private kubectl: KubernetesService,
    private pipelinesService: PipelinesService,
    private NotificationsService: NotificationsService,
    private configService: ConfigService,
    private eventsGateway: EventsGateway,
  ) {
    //this.logger.log('AppsService initialized');
  }

  public async getApp(
    pipelineName: string,
    phaseName: string,
    appName: string,
    userGroups: string[],
  ) {
    this.logger.debug(
      'get App: ' + appName + ' in ' + pipelineName + ' phase: ' + phaseName,
    );
    const contextName = await this.pipelinesService.getContext(
      pipelineName,
      phaseName,
      userGroups,
    );

    if (contextName) {
      try {
        const app = await this.kubectl.getApp(
          pipelineName,
          phaseName,
          appName,
          contextName,
        );
        app.metadata.managedFields = [{}];
        app.status.deployedRelease = undefined;
        return app;
      } catch (error) {
        this.logger.error('getApp error: ' + error);
        return null;
      }
    }
  }

  public async createApp(app: App, user: IUser, userGroups: string[]) {
    this.logger.debug(
      'create App: ' +
        app.name +
        ' in ' +
        app.pipeline +
        ' phase: ' +
        app.phase +
        ' deploymentstrategy: ' +
        app.deploymentstrategy,
    );

    if (process.env.KUBERO_READONLY == 'true') {
      this.logger.log(
        'KUBERO_READONLY is set to true, not creating app ' + app.name,
      );
      return;
    }

    const contextName = await this.pipelinesService.getContext(
      app.pipeline,
      app.phase,
      userGroups,
    );
    if (contextName) {
      await this.kubectl.createApp(app, contextName);

      const m = {
        name: 'newApp',
        user: user.id,
        resource: 'app',
        action: 'create',
        severity: 'normal',
        message:
          'Created new app: ' +
          app.name +
          ' in ' +
          app.pipeline +
          ' phase: ' +
          app.phase,
        pipelineName: app.pipeline,
        phaseName: app.phase,
        appName: app.name,
        data: {
          app: app,
        },
      } as INotification;
      this.NotificationsService.send(m);

      if (
        app.deploymentstrategy == 'git' &&
        (app.buildstrategy == 'dockerfile' ||
          app.buildstrategy == 'nixpacks' ||
          app.buildstrategy == 'buildpacks')
      ) {
        this.triggerImageBuildDelayed(
          app.pipeline,
          app.phase,
          app.name,
          userGroups,
        );
      }
    }
  }

  private async triggerImageBuildDelayed(
    pipeline: string,
    phase: string,
    appName: string,
    userGroups: string[],
  ) {
    // delay for 2 seconds to trigger the Image build
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return this.triggerImageBuild(pipeline, phase, appName, userGroups);
  }

  public async triggerImageBuild(
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

    const appresult = await this.getApp(pipeline, phase, appName, userGroups);

    const app = appresult as IKubectlApp;
    let repo = '';

    if (app.spec.gitrepo?.admin) {
      repo = app.spec.gitrepo.ssh_url || '';
    } else {
      repo = app.spec.gitrepo?.clone_url || '';
    }

    let dockerfilePath = 'Dockerfile';
    if (app.spec.buildstrategy === 'dockerfile') {
      //dockerfilePath = app.spec.dockerfile || 'Dockerfile';
    } else if (app.spec.buildstrategy === 'nixpacks') {
      dockerfilePath = '.nixpacks/Dockerfile';
    }

    const timestamp = new Date().getTime();
    if (contextName) {
      this.kubectl.setCurrentContext(contextName);

      this.kubectl.createBuildJob(
        namespace,
        appName,
        pipeline,
        app.spec.buildstrategy,
        dockerfilePath,
        {
          url: repo,
          ref: app.spec.branch, //git commit reference
        },
        {
          image: `${process.env.KUBERO_BUILD_REGISTRY}/${pipeline}-${appName}`,
          tag: app.spec.branch + '-' + timestamp,
        },
      );
    }

    return {
      status: 'ok',
      message: 'build started',
      deploymentstrategy: app?.spec?.deploymentstrategy,
      pipeline: pipeline,
      phase: phase,
      app: appName,
    };
  }

  // delete a app in a pipeline and phase
  public async deleteApp(
    pipelineName: string,
    phaseName: string,
    appName: string,
    user: IUser,
    userGroups: string[],
  ) {
    this.logger.debug(
      'delete App: ' + appName + ' in ' + pipelineName + ' phase: ' + phaseName,
    );

    if (process.env.KUBERO_READONLY == 'true') {
      console.log(
        'KUBERO_READONLY is set to true, not deleting app ' +
          appName +
          ' in ' +
          pipelineName +
          ' phase: ' +
          phaseName,
      );
      return;
    }

    const contextName = await this.pipelinesService.getContext(
      pipelineName,
      phaseName,
      userGroups,
    );
    if (contextName) {
      await this.kubectl.deleteApp(
        pipelineName,
        phaseName,
        appName,
        contextName,
      );
      //this.removeAppFromState(pipelineName, phaseName, appName);

      const m = {
        name: 'deleteApp',
        user: user.id,
        resource: 'app',
        action: 'delete',
        severity: 'normal',
        message:
          'Deleted app: ' +
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
      this.NotificationsService.send(m);
    }
  }

  public async createPRApp(
    branch: string,
    title: string,
    ssh_url: string,
    pipelineName: string | undefined,
    userGroups: string[],
  ) {
    const podSizeList = await this.configService.getPodSizes();

    if (process.env.KUBERO_READONLY == 'true') {
      console.log(
        'KUBERO_READONLY is set to true, not creating PR app ' +
          title +
          ' in ' +
          branch +
          ' pipeline: ' +
          pipelineName,
      );
      return;
    }

    this.logger.debug('createPRApp: ', userGroups, branch, title, ssh_url);
    const pipelines = await this.pipelinesService.listPipelines(userGroups);

    for (const pipeline of pipelines.items) {
      console.log(pipeline.git.repository?.ssh_url, ssh_url);
      console.log(pipeline.reviewapps);

      if (
        pipeline.reviewapps &&
        pipeline.git.repository &&
        pipeline.git.repository.ssh_url === ssh_url
      ) {
        if (pipelineName && pipelineName != pipeline.name) {
          continue;
        }

        this.logger.debug('found pipeline: ' + pipeline.name);
        const pipelaneName = pipeline.name;
        const phaseName = 'review';
        const websaveTitle = title.toLowerCase().replace(/[^a-z0-9-]/g, '-'); //TODO improve websave title

        const appOptions: IApp = {
          name: websaveTitle,
          pipeline: pipelaneName,
          sleep: 'disabled', //TODO use config value. This is BETA and should be disabled by default
          gitrepo: pipeline.git.repository,
          buildpack: pipeline.buildpack.name,
          deploymentstrategy: pipeline.deploymentstrategy,
          buildstrategy: 'plain', // TODO: use buildstrategy from pipeline
          phase: phaseName,
          branch: branch,
          autodeploy: true,
          podsize: podSizeList[0], //TODO select from podsizelist
          autoscale: false,
          basicAuth: {
            enabled: false,
            realm: '',
            accounts: [],
          },
          envVars:
            pipeline.phases.find((p) => p.name == phaseName)?.defaultEnvvars ||
            [],
          extraVolumes: [], //TODO Not sure how to handlle extra Volumes on PR Apps
          serviceAccount: {
            annotations: {},
            create: false,
            name: '',
          },
          image: {
            containerPort: 8080, //TODO use custom containerport
            repository: pipeline.dockerimage, // FIXME: Maybe needs a lookup into buildpack
            tag: 'main',
            command: [''],
            pullPolicy: 'Always',
            fetch: pipeline.buildpack.fetch,
            build: pipeline.buildpack.build,
            run: pipeline.buildpack.run,
          },
          web: {
            replicaCount: 1,
            autoscaling: {
              minReplicas: 0,
              maxReplicas: 0,
              targetCPUUtilizationPercentage: 0,
              targetMemoryUtilizationPercentage: 0,
            },
          },
          worker: {
            replicaCount: 0, // TODO should be dynamic
            autoscaling: {
              minReplicas: 0,
              maxReplicas: 0,
              targetCPUUtilizationPercentage: 0,
              targetMemoryUtilizationPercentage: 0,
            },
          },
          cronjobs: [],
          addons: [],
          resources: {},
          vulnerabilityscan: {
            enabled: false,
            schedule: '0 0 * * *',
            image: {
              repository: 'aquasec/trivy',
              tag: 'latest',
            },
          },
          ingress: {
            annotations: {},
            className: process.env.INGRESS_CLASSNAME || 'nginx',
            enabled: true,
            hosts: [
              {
                host:
                  websaveTitle +
                  '.' +
                  pipeline.phases.find((p) => p.name == phaseName)?.domain,
                paths: [
                  {
                    path: '/',
                    pathType: 'Prefix',
                  },
                ],
              },
            ],
            tls: [],
          },
          healthcheck: {
            enabled: false,
            path: '/',
            startupSeconds: 90,
            timeoutSeconds: 3,
            periodSeconds: 10,
          },
        };
        const app = new App(appOptions);

        //TODO: Logad git user
        const user = {
          username: 'unknown',
        } as IUser;

        this.createApp(app, user, userGroups);
        return { status: 'ok', message: 'app created ' + app.name };
      }
    }
  }

  public async getAllAppsList(contextName: string) {
    this.logger.debug('getAppsList');
    this.kubectl.setCurrentContext(contextName);
    const apps = await this.kubectl.getAllAppsList(contextName);
    const appslist = [] as IApp[];
    for (const app of apps.items) {
      appslist.push(app.spec);
    }
    return appslist;
  }

  public async getAppsByRepoAndBranch(repository: string, branch: string) {
    this.logger.debug('getAppsByBranch: ' + branch);

    const appslist = await this.getAllAppsList(
      process.env.KUBERO_CONTEXT || 'default',
    );
    const apps: IApp[] = [];
    for (const app of appslist) {
      if (app.branch === branch && repository === app.gitrepo?.ssh_url) {
        apps.push(app);
      }
    }
    return apps;
  }

  // delete a pr app in all pipelines that have review apps enabled and the same ssh_url
  public async deletePRApp(
    branch: string,
    title: string,
    ssh_url: string,
    userGroups: string[],
  ) {
    this.logger.debug('destroyPRApp');
    const websaveTitle = title.toLowerCase().replace(/[^a-z0-9-]/g, '-'); //TODO improve websave title

    const appslist = await this.getAllAppsList(
      process.env.KUBERO_CONTEXT || 'default',
    );

    for (const app of appslist) {
      if (
        app.phase === 'review' &&
        app.gitrepo &&
        app.gitrepo.ssh_url === ssh_url &&
        app.branch === branch
      ) {
        const user = {
          username: 'unknown',
        } as IUser;

        this.deleteApp(app.pipeline, app.phase, websaveTitle, user, userGroups);
      }
    }
  }

  public async rebuildApp(app: IApp, userGroups: string[]) {
    this.logger.debug(
      'rebuild App: ' +
        app.name +
        ' in ' +
        app.pipeline +
        ' phase: ' +
        app.phase,
    );

    const contextName = await this.pipelinesService.getContext(
      app.pipeline,
      app.phase,
      userGroups,
    );

    if (contextName) {
      if (
        app.deploymentstrategy == 'docker' ||
        app.buildstrategy == undefined ||
        app.buildstrategy == 'plain'
      ) {
        this.kubectl.restartApp(
          app.pipeline,
          app.phase,
          app.name,
          'web',
          contextName,
        );
        this.kubectl.restartApp(
          app.pipeline,
          app.phase,
          app.name,
          'worker',
          contextName,
        );
      } else {
        // rebuild for buildstrategy git/dockerfile or git/nixpacks
        this.triggerImageBuild(app.pipeline, app.phase, app.name, userGroups);
      }

      const m = {
        name: 'restartApp',
        user: '',
        resource: 'app',
        action: 'restart',
        severity: 'normal',
        message:
          'Rebuild app: ' +
          app.name +
          ' in ' +
          app.pipeline +
          ' phase: ' +
          app.phase,
        pipelineName: app.pipeline,
        phaseName: app.phase,
        appName: app.name,
        data: {},
      } as INotification;
      this.NotificationsService.send(m);
    }
  }

  public async getTemplate(
    pipelineName: string,
    phaseName: string,
    appName: string,
    userGroups: string[],
  ) {
    const app = await this.getApp(pipelineName, phaseName, appName, userGroups);

    const a = app as IKubectlApp;
    const t = new KubectlTemplate(a.spec);

    //Convert template to Yaml
    const template = this.YAML.stringify(t, {
      indent: 4,
      resolveKnownTags: true,
    });

    return template;
  }

  public async restartApp(
    pipelineName: string,
    phaseName: string,
    appName: string,
    user: IUser,
    userGroups: string[],
  ) {
    if (process.env.KUBERO_READONLY == 'true') {
      console.log(
        'KUBERO_READONLY is set to true, not restarting app' +
          appName +
          ' in ' +
          pipelineName +
          ' phase: ' +
          phaseName,
      );
      return;
    }

    this.logger.debug(
      'restart App: ' +
        appName +
        ' in ' +
        pipelineName +
        ' phase: ' +
        phaseName,
    );
    const contextName = await this.pipelinesService.getContext(
      pipelineName,
      phaseName,
      userGroups,
    );
    if (contextName) {
      this.kubectl.restartApp(
        pipelineName,
        phaseName,
        appName,
        'web',
        contextName,
      );
      this.kubectl.restartApp(
        pipelineName,
        phaseName,
        appName,
        'worker',
        contextName,
      );

      const m = {
        name: 'restartApp',
        user: user.id,
        resource: 'app',
        action: 'restart',
        severity: 'normal',
        message:
          'Restarted app: ' +
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
      this.NotificationsService.send(m);
    }
  }

  // update an app in a pipeline and phase
  public async updateApp(
    app: App,
    resourceVersion: string,
    user: IUser,
    userGroups: string[],
  ) {
    this.logger.debug(
      'update App: ' +
        app.name +
        ' in ' +
        app.pipeline +
        ' phase: ' +
        app.phase,
    );
    //await this.pipelinesService.setContext(app.pipeline, app.phase);

    if (process.env.KUBERO_READONLY == 'true') {
      console.log(
        'KUBERO_READONLY is set to true, not updating app ' + app.name,
      );
      return;
    }

    const contextName = await this.pipelinesService.getContext(
      app.pipeline,
      app.phase,
      userGroups,
    );

    if (
      app.deploymentstrategy == 'git' &&
      (app.buildstrategy == 'dockerfile' ||
        app.buildstrategy == 'nixpacks' ||
        app.buildstrategy == 'buildpacks')
    ) {
      this.triggerImageBuild(app.pipeline, app.phase, app.name, userGroups);
    }

    if (contextName) {
      await this.kubectl.updateApp(app, resourceVersion, contextName);
      // IMPORTANT TODO : Update this.appStateList !!

      const m = {
        name: 'updateApp',
        user: user.id,
        resource: 'app',
        action: 'update',
        severity: 'normal',
        message:
          'Updated app: ' +
          app.name +
          ' in ' +
          app.pipeline +
          ' phase: ' +
          app.phase,
        pipelineName: app.pipeline,
        phaseName: app.phase,
        appName: app.name,
        data: {
          app: app,
        },
      } as INotification;
      this.NotificationsService.send(m);
    }
  }

  public async getPods(
    pipelineName: string,
    phaseName: string,
    appName: string,
    userGroups: string[],
  ): Promise<Workload[]> {
    const contextName = await this.pipelinesService.getContext(
      pipelineName,
      phaseName,
      userGroups,
    );
    const namespace = pipelineName + '-' + phaseName;

    const workloads: Workload[] = [];

    if (contextName) {
      this.kubectl.setCurrentContext(contextName);
      const workload = await this.kubectl.getPods(namespace, contextName);
      //return workload
      for (const pod of workload) {
        // check if app label name starts with appName
        if (!pod.metadata?.generateName?.startsWith(appName + '-kuberoapp')) {
          continue;
        }

        const workload = {
          name: pod.metadata?.name,
          namespace: pod.metadata?.namespace,
          phase: phaseName,
          pipeline: pipelineName,
          status: pod.status?.phase,
          age: pod.metadata?.creationTimestamp,
          startTime: pod.status?.startTime,
          containers: [] as WorkloadContainer[],
        } as Workload;

        //for (const container of pod.spec?.containers || []) {
        const containersCount = pod.spec?.containers?.length || 0;
        for (let i = 0; i < containersCount; i++) {
          workload.containers.push({
            name: pod.spec?.containers[i].name,
            image: pod.spec?.containers[i].image,
            restartCount: pod.status?.containerStatuses?.[i]?.restartCount,
            ready: pod.status?.containerStatuses?.[i]?.ready,
            started: pod.status?.containerStatuses?.[i]?.started,
          } as WorkloadContainer);
        }

        workloads.push(workload);
      }
    }
    return workloads;
  }

  public async execInContainer(
    pipelineName: string,
    phaseName: string,
    appName: string,
    podName: string,
    containerName: string,
    command: string,
    user: IUser,
    userGroups: string[],
  ) {
    /*TODO: Fails. Needs to be loaded somewhere
    const settings = await this.settingsService.getSettings();
    console.log(settings.kubero?.console?.enabled)
    if (settings.kubero?.console?.enabled != true) {
        this.logger.warning('Warning: console is nost set or disabled in config');
        return;
    }
    */

    const contextName = await this.pipelinesService.getContext(
      pipelineName,
      phaseName,
      userGroups,
    );
    if (contextName) {
      const streamname = `${pipelineName}-${phaseName}-${appName}-${podName}-${containerName}-terminal`;

      if (process.env.KUBERO_READONLY == 'true') {
        console.log(
          'KUBERO_READONLY is set to true, terminal access not allowed',
        );
        return;
      }

      if (this.eventsGateway.execStreams[streamname]) {
        if (
          this.eventsGateway.execStreams[streamname].websocket.readyState ==
          this.eventsGateway.execStreams[streamname].websocket.OPEN
        ) {
          console.log('execInContainer: execStream already running');
          return;
        } else {
          console.log(
            'CLOSED',
            this.eventsGateway.execStreams[streamname].websocket.CLOSED,
          );
          console.log(
            'execInContainer: execStream already running but not open, deleting :',
            this.eventsGateway.execStreams[streamname].websocket.readyState,
          );
          delete this.eventsGateway.execStreams[streamname];

          // wait a bit to make sure the stream is closed
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      const execStream = new Stream.PassThrough();

      const namespace = pipelineName + '-' + phaseName;
      const ws = await this.kubectl
        .execInContainer(namespace, podName, containerName, command, execStream)
        .catch((error) => {
          console.log(error);
          return;
        });

      if (!ws || ws.readyState != ws.OPEN) {
        console.log('execInContainer: ws is undefined or not open');
        return;
      }

      const stream = {
        websocket: ws as unknown as WebSocket,
        stream: execStream,
      };
      this.eventsGateway.execStreams[streamname] = stream;

      // sending the terminal output to the client
      ws.on('message', (data: Buffer) => {
        this.eventsGateway.sendTerminalLine(streamname, data.toString());
      });
    }
  }

  public async countApps(): Promise<number> {
    const contextName = this.kubectl.getCurrentContext();
    const apps = await this.kubectl.getAllAppsList(contextName);
    return apps.items.length;
  }
}
