import { Injectable, Logger } from '@nestjs/common';
import { PipelinesService } from '../pipelines/pipelines.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { NotificationsService } from '../notifications/notifications.service';
import { IKubectlApp } from '../kubernetes/kubernetes.interface';
import { INotification } from '../notifications/notifications.interface';
import { App } from './app/app';
import { IApp } from './apps.interface';
import { IPipelineList } from '../pipelines/pipelines.interface';
import { IUser } from '../auth/auth.interface';
import { SettingsService } from 'src/settings/settings.service';
//import YAML from 'yaml';
import { KubectlTemplate } from 'src/templates/template';


@Injectable()
export class AppsService {

  private logger = new Logger(AppsService.name);
  private YAML = require('yaml');

  constructor(
    private kubectl: KubernetesService,
    private pipelinesService: PipelinesService,
    private NotificationsService: NotificationsService,
    private settingsService: SettingsService
  ) {}
  
  public async getApp(pipelineName: string, phaseName: string, appName: string) {
    this.logger.debug('get App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
    const contextName = await this.pipelinesService.getContext(pipelineName, phaseName);
    
    if (contextName) {
        try {
        let app = await this.kubectl.getApp(pipelineName, phaseName, appName, contextName);
            app.metadata.managedFields = [{}];
            app.status.deployedRelease = undefined;
            return app;
        } catch (error) {
            this.logger.error('getApp error: '+error);
            return null;
        }
    }
  }

  public async createApp(app: App, user: IUser) {
    this.logger.debug('create App: '+app.name+' in '+ app.pipeline+' phase: '+app.phase + ' deploymentstrategy: '+app.deploymentstrategy);

    if ( process.env.KUBERO_READONLY == 'true'){
        this.logger.log('KUBERO_READONLY is set to true, not creating app ' + app.name);
        return;
    }

    const contextName = await this.pipelinesService.getContext(app.pipeline, app.phase);
    if (contextName) {
        await this.kubectl.createApp(app, contextName);

        if (app.deploymentstrategy == 'git' && (app.buildstrategy == 'dockerfile' || app.buildstrategy == 'nixpacks' || app.buildstrategy == 'buildpacks')){
            this.triggerImageBuild(app.pipeline, app.phase, app.name);
        }
        //this.appStateList.push(app);
        
        const m = {
            'name': 'newApp',
            'user': user.username,
            'resource': 'app',
            'action': 'create',
            'severity': 'normal',
            'message': 'Created new app: '+app.name+' in '+ app.pipeline+' phase: '+app.phase,
            'pipelineName':app.pipeline,
            'phaseName': app.phase,
            'appName': app.name,
            'data': {
                'app': app
            }
        } as INotification;
        this.NotificationsService.send(m);
    }

  }

  public async triggerImageBuild(pipeline: string, phase: string, appName: string) {
    const contextName = await this.pipelinesService.getContext(pipeline, phase);
    const namespace = pipeline+'-'+phase;

    const appresult = await this.getApp(pipeline, phase, appName)


    const app = appresult as IKubectlApp;
    let repo = '';

    if (app.spec.gitrepo?.admin) {
        repo = app.spec.gitrepo.ssh_url || "";
    } else {
        repo = app.spec.gitrepo?.clone_url || "";
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
                image: `${process.env.KUBERO_BUILD_REGISTRY}/${pipeline}/${appName}`,
                tag: app.spec.branch+"-"+timestamp
            }
        );
    }

    return {
        status: 'ok',
        message: 'build started',
        deploymentstrategy: app?.spec?.deploymentstrategy,
        pipeline: pipeline,
        phase: phase,
        app: appName
    };
  }

  // delete a app in a pipeline and phase
  public async deleteApp(pipelineName: string, phaseName: string, appName: string, user: IUser) {
    this.logger.debug('delete App: '+appName+' in '+ pipelineName+' phase: '+phaseName);

    if ( process.env.KUBERO_READONLY == 'true'){
        console.log('KUBERO_READONLY is set to true, not deleting app '+appName+' in '+ pipelineName+' phase: '+phaseName);
        return;
    }

    const contextName = await this.pipelinesService.getContext(pipelineName, phaseName);
    if (contextName) {
        await this.kubectl.deleteApp(pipelineName, phaseName, appName, contextName);
        //this.removeAppFromState(pipelineName, phaseName, appName);

        const m = {
            'name': 'deleteApp',
            'user': user.username,
            'resource': 'app',
            'action': 'delete',
            'severity': 'normal',
            'message': 'Deleted app: '+appName+' in '+ pipelineName+' phase: '+phaseName,
            'pipelineName':pipelineName,
            'phaseName': phaseName,
            'appName': appName,
            'data': {}
        } as INotification;
        this.NotificationsService.send(m);
    }
  }

  public async createPRApp(branch: string, title: string, ssh_url: string, pipelineName: string | undefined) {

    const podSizeList = await this.settingsService.getPodSizes();

    if ( process.env.KUBERO_READONLY == 'true'){
        console.log('KUBERO_READONLY is set to true, not creating PR app '+title+' in '+ branch+' pipeline: '+pipelineName);
        return;
    }

    this.logger.debug('createPRApp: ', branch, title, ssh_url);
    let pipelines = await this.pipelinesService.listPipelines() as IPipelineList;

    for (const pipeline of pipelines.items) {
        console.log(pipeline.git.repository?.ssh_url, ssh_url);
        console.log(pipeline.reviewapps);

        if (pipeline.reviewapps &&
            pipeline.git.repository &&
            pipeline.git.repository.ssh_url === ssh_url) {

            if (pipelineName && pipelineName != pipeline.name) {
                continue;
            }

            this.logger.debug('found pipeline: '+pipeline.name);
            let pipelaneName = pipeline.name
            let phaseName = 'review';
            let websaveTitle = title.toLowerCase().replace(/[^a-z0-9-]/g, '-'); //TODO improve websave title

            let appOptions:IApp = {
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
                    accounts: []
                },
                envVars: pipeline.phases.find(p => p.name == phaseName)?.defaultEnvvars || [],
                extraVolumes: [], //TODO Not sure how to handlle extra Volumes on PR Apps
                serviceAccount: {
                    annotations: {},
                    create: false,
                    name: ''
                },
                image: {
                    containerPort: 8080, //TODO use custom containerport
                    repository: pipeline.dockerimage, // FIXME: Maybe needs a lookup into buildpack
                    tag: "main",
                    command: [''],
                    pullPolicy: "Always",
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
                        targetMemoryUtilizationPercentage: 0
                    }
                },
                worker: {
                    replicaCount: 0, // TODO should be dynamic
                    autoscaling: {
                        minReplicas: 0,
                        maxReplicas: 0,
                        targetCPUUtilizationPercentage: 0,
                        targetMemoryUtilizationPercentage: 0
                    }
                },
                cronjobs: [],
                addons: [],
                resources: {},
                vulnerabilityscan: {
                    enabled: false,
                    schedule: "0 0 * * *",
                    image: {
                        repository: "aquasec/trivy",
                        tag: "latest"
                    }
                },
                ingress: {
                    annotations: {},
                    className: process.env.INGRESS_CLASSNAME || 'nginx',
                    enabled: true,
                    hosts: [
                        {
                            host: websaveTitle+"."+pipeline.phases.find(p => p.name == phaseName)?.domain,
                            paths: [
                                {
                                    path: "/",
                                    pathType: "Prefix"
                                }
                            ]
                        }
                    ],
                    tls: []
                },
                healthcheck: {
                    enabled: false,
                    path: "/",
                    startupSeconds: 90,
                    timeoutSeconds: 3,
                    periodSeconds: 10
                },
            }
            let app = new App(appOptions);

            //TODO: Logad git user
            const user = {
                username: 'unknown'
            } as IUser;

            this.createApp(app, user);
            return { status: 'ok', message: 'app created '+app.name };
        }
    }
  }

  public async getTemplate(pipelineName: string, phaseName: string, appName: string ) {
    const app = await this.getApp(pipelineName, phaseName, appName);
    
    const a = app as IKubectlApp;
    let t =  new KubectlTemplate(a.spec as IApp);

    //Convert template to Yaml
    const template = this.YAML.stringify(t, {indent: 4, resolveKnownTags: true});

    return template
  }

  public async restartApp(pipelineName: string, phaseName: string, appName: string, user: IUser) {

    if ( process.env.KUBERO_READONLY == 'true'){
        console.log('KUBERO_READONLY is set to true, not restarting app'+appName+' in '+ pipelineName+' phase: '+phaseName);
        return;
    }

    this.logger.debug('restart App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
    const contextName = await this.pipelinesService.getContext(pipelineName, phaseName);
    if (contextName) {
        this.kubectl.restartApp(pipelineName, phaseName, appName, 'web', contextName);
        this.kubectl.restartApp(pipelineName, phaseName, appName, 'worker', contextName);

        const m = {
            'name': 'restartApp',
            'user': user.username,
            'resource': 'app',
            'action': 'restart',
            'severity': 'normal',
            'message': 'Restarted app: '+appName+' in '+ pipelineName+' phase: '+phaseName,
            'pipelineName': pipelineName,
            'phaseName': phaseName,
            'appName': appName,
            'data': {}
        } as INotification;
        this.NotificationsService.send(m);
    }
  }
}
