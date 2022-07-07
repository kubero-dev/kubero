import debug from 'debug';
import { Server } from "socket.io";
import { IApp, IPipeline, IKubectlAppList, IKubectlPipelineList, IKubectlApp, IPodSize, IKuberoConfig} from './types';
import { App } from './modules/application';
import { GithubApi } from './github/api';
import { IAddon, IAddonMinimal } from './modules/addons';
import * as crypto from "crypto"
import set from 'lodash.set';
import YAML from 'yaml';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { Stream } from 'stream';
//const stream = require('stream');

debug('app:keroku')

import { Kubectl } from './modules/kubectl';
import { throws } from 'assert';

export class Keroku {
    public kubectl: Kubectl;
    private _io: Server;
    private githubApi: GithubApi;
    private appStateList: IApp[] = [];
    private pipelineStateList: IPipeline[] = [];
    private podLogStreams: string[]= []
    public config: IKuberoConfig;

    constructor(io: Server) {
        this.kubectl = new Kubectl();
        this._io = io;

        this.githubApi = new GithubApi(process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string);
        this.config = this.loadConfig(process.env.KUBERO_CONFIG_PATH as string || './config.yaml');
        debug.debug('Kubero Config: '+JSON.stringify(this.config));
    }

    public init() {
        this.listPipelines().then(pl => {
            for (const pipeline of pl.items as IPipeline[]) {
                this.pipelineStateList.push(pipeline);
                
                for (const phase of pipeline.phases) {

                    if (phase.enabled == true) {
                        debug.log("Checking Namespace: "+pipeline.name+"-"+phase.name);
                        this.listAppsInNamespace(pipeline.name, phase.name).then(appsList => {
                            if (appsList) {
                                for (const app of appsList.items) {
                                    debug.log("added App to state: "+app.spec.name);
                                    this.appStateList.push(app.spec);
                                }
                            }
                        })
                    }
                }
            }
        }
        ).catch(error => {
            debug.log(error);
        });
    }

    public getContexts() {
        return this.kubectl.getContexts()
    }
    public getPipelineStateList() {
        return this.pipelineStateList;
    }

    public getContext(pipelineName: string, phaseName: string): string {
        let context: string = 'missing-'+pipelineName+'-'+phaseName;
        for (const pipeline of this.pipelineStateList) {
            if (pipeline.name == pipelineName) {
                for (const phase of pipeline.phases) {
                    if (phase.name == phaseName) {
                        //this.kubectl.setCurrentContext(phase.context);
                        context = phase.context;
                    }
                }
            }
        }
        return context
    }

    public async setContext(pipelineName: string, phaseName: string): Promise<boolean> {
        const context = this.getContext(pipelineName, phaseName)
        if (context) {
            await this.kubectl.setCurrentContext(context);
            return true;
        } else {
            return false;
        }
    }

    public async getAppStateList(): Promise<IApp[]> {
        return this.appStateList;
    }

    public async listAppsInNamespace(pipelineName: string, phaseName: string): Promise<IKubectlAppList | undefined> {
        const namespace = pipelineName+'-'+phaseName;
        const contextName = this.getContext(pipelineName, phaseName);
        if (contextName) {
            debug.debug('listAppsInNamespace: '+namespace);
            let apps = await this.kubectl.getAppsList(namespace, contextName);
            return apps;
        }
    }

    // creates a new pipeline in the same namespace as the kubero app
    public async newPipeline(pipeline: IPipeline) {
        debug.debug('create newPipeline: '+pipeline.name);

        // Create the Pipeline CRD
        await this.kubectl.createPipeline(pipeline);

        // create namespace for each phase
        let secretData = {
            'github.pub': Buffer.from(process.env.GIT_DEPLOYMENTKEY_PUBLIC as string).toString('base64'),
            'github': process.env.GIT_DEPLOYMENTKEY_PRIVATE_B64 as string,
        }
        for (const phase of pipeline.phases) {
            if (phase.enabled == true) {
                const namespace = pipeline.name+'-'+phase.name;
                await this.kubectl.createNamespace(namespace, phase.context);
                await this.kubectl.createSecret(namespace, "deployment-keys", secretData, phase.context);
            }
        }
        // update agents
        this._io.emit('updatedPipelines', "created");
    }

    public async listPipelines() {
        debug.debug('listPipeline');
        let pipelines = await this.kubectl.getPipelinesList();
        const ret = {
            items: new Array()
        }
        for (const pipeline of pipelines.items) {
            debug.debug('listed pipeline: '+pipeline.spec.name);
            ret.items.push(pipeline.spec);
        }
        return ret;
    }

    // delete a pipeline and all its namespaces/phases
    public deletePipeline(pipelineName: string) {
        debug.debug('deletePipeline: '+pipelineName);

        this.kubectl.getPipeline(pipelineName).then(async pipeline =>{
            if (pipeline) {
                await this.kubectl.deletePipeline(pipelineName);
                for (const phase of pipeline.spec.phases) {
                    if (phase.enabled == true) {
                        const namespace = pipeline.spec.name+"-"+phase.name;
                        await this.kubectl.deleteNamespace(namespace, phase.context);
                    }
                }
                this._io.emit('updatedPipelines', "deleted");
            }
        })
        .catch(error => {
            debug.debug(error);
        });
    }

    // create a new app in a specified pipeline and phase
    public async newApp(app: App) {
        debug.log('create App: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
        const contextName = this.getContext(app.pipeline, app.phase);
        if (contextName) {
            await this.kubectl.createApp(app, contextName);
            this.appStateList.push(app);
            
            let namespace = app.pipeline+'-'+app.phase;
            this.createAddons(app.addons, namespace, contextName);
            this._io.emit('updatedApps', "created");
        }
    }

    // update an app in a pipeline and phase
    public async updateApp(app: App, resourceVersion: string) {
        debug.debug('update App: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
        await this.setContext(app.pipeline, app.phase);
        
        const contextName = this.getContext(app.pipeline, app.phase);
        if (contextName) {
            await this.kubectl.updateApp(app, resourceVersion, contextName);
            // IMPORTANT TODO : Update this.appStateList !!

            let namespace = app.pipeline+'-'+app.phase;
            //TODO: the addons are created even when they exist. This should be handled in a better way
            this.createAddons(app.addons, namespace, contextName);
            this._io.emit('updatedApps', "updated");
        }
    }

    // delete a app in a pipeline and phase
    public async deleteApp(pipelineName: string, phaseName: string, appName: string) {
        debug.debug('delete App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
        const contextName = this.getContext(pipelineName, phaseName);
        if (contextName) {
            await this.kubectl.deleteApp(pipelineName, phaseName, appName, contextName);
            this.removeAppFromState(pipelineName, phaseName, appName);
            this._io.emit('updatedApps', "deleted");
        }
    }
    
    private removeAppFromState(pipelineName: string, phaseName: string, appName: string) {
        for (let i = 0; i < this.appStateList.length; i++) {
            if (this.appStateList[i].name == appName && 
                this.appStateList[i].pipeline == pipelineName && 
                this.appStateList[i].phase == phaseName) {
                this.appStateList.splice(i, 1);
            }
        }
    }

    // get a app in a pipeline and phase
    public async getApp(pipelineName: string, phaseName: string, appName: string) {
        debug.debug('get App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
        const contextName = this.getContext(pipelineName, phaseName);
        if (contextName) {
            let app = await this.kubectl.getApp(pipelineName, phaseName, appName, contextName);
            return app;
        }
    }

    // list all apps in a pipeline
    public async getPipelineWithApps(pipelineName: string) {
        debug.debug('listApps in '+pipelineName);
        await this.kubectl.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
        const kpipeline = await this.kubectl.getPipeline(pipelineName);
        let pipeline = kpipeline.spec

        if (pipeline) {
            for (const phase of pipeline.phases) {
                if (phase.enabled == true) {

                    const contextName = this.getContext(pipelineName, phase.name);
                    if (contextName) {
                        const namespace = pipelineName+'-'+phase.name;
                        let apps = await this.kubectl.getAppsList(namespace, contextName);
                        
                        let appslist = new Array();
                        for (const app of apps.items) {
                            appslist.push(app.spec);
                        }
                        // @ts-expect-error ts(2532) FIXME: Object is possibly 'undefined'.
                        pipeline.phases.find(p => p.name == phase.name).apps = appslist;
                        
                    }
                }
            }
        }
        return pipeline;
    }

    public restartApp(pipelineName: string, phaseName: string, appName: string) {
        debug.debug('restart App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
        const contextName = this.getContext(pipelineName, phaseName);
        if (contextName) {
            this.kubectl.restartApp(pipelineName, phaseName, appName, 'web', contextName);
            this.kubectl.restartApp(pipelineName, phaseName, appName, 'worker', contextName);

            let message = {
                'action': 'restarted', 
                'pipeline':pipelineName, 
                'phase':phaseName, 
                'app': appName
            }
            //this._io.emit('restartedApp', message);
        }
    }
/*
    public deployApp(pipelineName: string, phaseName: string, appName: string) {
        debug.debug('deploy App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
        this.kubectl.deployApp(pipelineName, phaseName, appName);
        this._io.emit('updatedApps', "deployed");
    }
*/
    public async connectPipeline(gitrepo: string) {
        debug.log('connectPipeline: '+gitrepo);

        if (process.env.GIT_DEPLOYMENTKEY_PRIVATE_B64 == undefined) {
            throw new Error("GIT_DEPLOYMENTKEY_PRIVATE_B64 is not defined");
        }
        if (process.env.GIT_DEPLOYMENTKEY_PUBLIC == undefined) {
            throw new Error("GIT_DEPLOYMENTKEY_PUBLIC is not defined");
        }
        if (process.env.GITHUB_WEBHOOK_SECRET == undefined) {
            throw new Error("GITHUB_WEBHOOK_SECRET is not defined");
        }
        if (process.env.GITHUB_WEBHOOK_URL == undefined) {
            throw new Error("GITHUB_WEBHOOK_URL is not defined");
        }

        let repository = await this.githubApi.getRepository(gitrepo);

        let webhhok = await this.githubApi.addWebhook(
            repository.data.owner,
            repository.data.name,
            process.env.GITHUB_WEBHOOK_URL,
            process.env.GITHUB_WEBHOOK_SECRET,
        );

        let keys = await this.githubApi.addDeployKey(repository.data.owner, repository.data.name, process.env.GIT_DEPLOYMENTKEY_PUBLIC as string);

        return {keys: keys, repository: repository, webhook: webhhok};
    }

    public async handleGithubWebhook(event: string, delivery: string, signature: string, body: any) {
        debug.log('handleGithubWebhook');

        //https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
        let secret = process.env.GITHUB_WEBHOOK_SECRET as string;
        let hash = 'sha256='+crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex')
        if (hash === signature) {
            debug.debug('Github webhook signature is valid for event: '+delivery);

            switch (event) {
                case 'push':
                    this.handleGithubPush(body);
                    break;
                case 'pull_request':
                    this.handleGithubPullRequest(body);
                    break;
                default:
                    debug.log('Github webhook event not handled: '+event);
                    break;
            }
        } else {
            debug.log('ERROR: invalid signature for event: '+delivery);
            debug.log(hash);
            debug.log(signature);
        }
    }

    private async handleGithubPush(body: any) {
        debug.log('handleGithubPush');
        let ref = body.ref
        let refs = ref.split('/')
        let branch = refs[refs.length - 1]
        let apps = await this.getAppsByBranch(branch);

        for (const app of apps) {
            this.restartApp(app.pipeline, app.phase, app.name);
        }
    }

    private async getAppsByBranch(branch: string) {
        debug.log('getAppsByBranch: '+branch);
        let apps: IApp[] = [];
        for (const app of this.appStateList) {
            if (app.branch === branch) {
                apps.push(app);
            }
        }
        return apps;
    }

    private async handleGithubPullRequest(body: any) {
        debug.log('handleGithubPullRequest');
        let pullRequest = body.pull_request;
        debug.debug(body.action);

        switch (body.action) {
            case 'opened':
            case 'reopened':
                this.createPRApp(pullRequest.head.ref, pullRequest.head.ref, pullRequest.head.repo.ssh_url)
                break;
            case 'closed':
                this.deletePRApp(pullRequest.head.ref, pullRequest.head.ref, pullRequest.head.repo.ssh_url)
                break;
            default:
                break;
        }
    }

    // creates a PR App in all Pipelines that have review apps enabled and the same ssh_url
    private async createPRApp(branch: string, title: string, ssh_url: string) {
        let pipelines = await this.listPipelines() as IKubectlPipelineList;

        for (const pipeline of pipelines.items) {

            if (pipeline.spec.reviewapps && 
                pipeline.spec.github.repository && 
                pipeline.spec.github.repository.ssh_url === ssh_url) {
                
                debug.debug('found pipeline: '+pipeline.spec.name);
                let pipelaneName = pipeline.spec.name
                let phaseName = 'review';
                let websaveTitle = title.toLowerCase().replace(/[^a-z0-9-]/g, '-'); //TODO improve websave title
                
                let appOptions:IApp = {
                    name: websaveTitle,
                    pipeline: pipelaneName,
                    gitrepo: pipeline.spec.github.repository,
                    phase: phaseName,
                    branch: branch,
                    autodeploy: true,
                    domain: websaveTitle+'.lacolhost.com', //TODO use a default domain, defined somewhere
                    podsize: this.config.podSizeList[0], //TODO select from podsizelist
                    autoscale: false,
                    envVars: [], //TODO use custom env vars,
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
                        replicaCount: 0, // TODO my be dynamic
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

                }
                let app = new App(appOptions);
    
                this.newApp(app);
            }
        }
    }

    // delete a pr app in all pipelines that have review apps enabled and the same ssh_url
    private async deletePRApp(branch: string, title: string, ssh_url: string) {
        debug.log('destroyPRApp');
        let websaveTitle = title.toLowerCase().replace(/[^a-z0-9-]/g, '-'); //TODO improve websave title

        for (const app of this.appStateList) {
            
            if (app.phase === 'review' && 
                app.gitrepo && 
                app.gitrepo.ssh_url === ssh_url && 
                app.branch === branch) {
                
                    this.deleteApp(app.pipeline, app.phase, websaveTitle);
            }
        }
    }

    private async createAddons(addons: IAddon[], namespace: string, context: string) {
        for (const addon of addons) {
            for (const field in addon.formfields) {
                let val = addon.formfields[field].default;
                
                if (addon.formfields[field].type === 'number') {
                    val = Number(val);
                }

                set(addon.crd, field, val);
            }

            this.kubectl.createAddon(addon, namespace, context);
        }
    }

    // delete a addon in a namespace
    public async deleteAddon(addon: IAddonMinimal): Promise<void> {
        debug.log(`Deleting addon ${addon.id}`)
        const contextName = this.getContext(addon.pipeline, addon.phase);
        if (contextName) {
            this.kubectl.deleteAddon(addon, contextName);
        }
    }

    // Loads the app config from the config file
    private loadConfig(path:string): IKuberoConfig {
        try {
            let config = YAML.parse(fs.readFileSync(path, 'utf8')) as IKuberoConfig;
            return config;
        } catch (error) {
            debug.log('FATAL ERROR: could not load config file: '+path);
            debug.log(error);
            process.exit(1);
        }
    }

    public getPodSizeList(){
        return this.config.podSizeList;
    }

    public emitLogs(pipelineName: string, phaseName: string, appName: string, podName: string, container: string) {
        
        const logStream = new Stream.PassThrough();

        logStream.on('data', (chunk: any) => {
            // use write rather than console.log to prevent double line feed
            //process.stdout.write(chunk);
            const roomname = `${pipelineName}-${phaseName}-${appName}`;
            this._io.to(roomname).emit('log', {
                id: uuidv4(),
                time: new Date().getTime(),
                pipeline: pipelineName,
                phase: phaseName,
                app: appName,
                pod: podName,
                podID: podName.split('-')[3]+'-'+podName.split('-')[4],
                container: container,
                log: chunk.toString()
            });
        });

        const contextName = this.getContext(pipelineName, phaseName);
        const namespace = pipelineName+'-'+phaseName;

        if (contextName) {
            this.kubectl.setCurrentContext(contextName);

            if (!this.podLogStreams.includes(podName)) {

                this.kubectl.log.log(namespace, podName, container, logStream, {follow: true, tailLines: 50, pretty: false, timestamps: false})
                .then(res => {
                    debug.log('logs started for '+podName+' '+container);
                    this.podLogStreams.push(podName);
                })
                .catch(err => {
                    debug.log(err);
                });
            } else {
                debug.debug('logs already running '+podName+' '+container);
            }
        }
    }

    public startLogging(pipelineName: string, phaseName: string, appName: string) {
        const contextName = this.getContext(pipelineName, phaseName);
        const namespace = pipelineName+'-'+phaseName;

        if (contextName) {
            this.kubectl.getPods(namespace, contextName).then((pods: any[]) => {
                for (const pod of pods) {

                    if (pod.metadata.name.startsWith(appName)) {
                        for (const container of pod.spec.containers) {
                            this.emitLogs(pipelineName, phaseName, appName, pod.metadata.name, container.name);
                        }
                    }
                }
            });
        }
    }
}