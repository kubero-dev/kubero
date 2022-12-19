import debug from 'debug';
import { Server } from "socket.io";
import { IApp, IPipeline, IPipelineList, IKubectlAppList, IDeployKeyPair, IKubectlPipelineList, IKubectlApp, IPodSize, IKuberoConfig} from './types';
import { App } from './modules/application';
import { GithubApi } from './git/github';
import { BitbucketApi } from './git/bitbucket';
import { GiteaApi } from './git/gitea';
import { GogsApi } from './git/gogs';
import { GitlabApi } from './git/gitlab';
import { IWebhook} from './git/types';
import YAML from 'yaml';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { Stream } from 'stream';
//const stream = require('stream');

debug('app:kubero')

import { Kubectl } from './modules/kubectl';

export class Kubero {
    public kubectl: Kubectl;
    private _io: Server;
    private githubApi: GithubApi;
    private giteaApi: GiteaApi;
    private gogsApi: GogsApi;
    private gitlabApi: GitlabApi;
    private bitbucketApi: BitbucketApi;
    private appStateList: IApp[] = [];
    private pipelineStateList: IPipeline[] = [];
    private podLogStreams: string[]= []
    public config: IKuberoConfig;

    constructor(io: Server) {
        this.config = this.loadConfig(process.env.KUBERO_CONFIG_PATH as string || './config.yaml');
        this.kubectl = new Kubectl(this.config);
        this._io = io;

        this.giteaApi = new GiteaApi(process.env.GITEA_BASEURL as string, process.env.GITEA_PERSONAL_ACCESS_TOKEN as string);
        this.gogsApi = new GogsApi(process.env.GOGS_BASEURL as string, process.env.GOGS_PERSONAL_ACCESS_TOKEN as string);
        this.githubApi = new GithubApi(process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string);
        this.gitlabApi = new GitlabApi(process.env.GITLAB_BASEURL as string, process.env.GITLAB_PERSONAL_ACCESS_TOKEN as string);
        this.bitbucketApi = new BitbucketApi(process.env.BITBUCKET_USERNAME as string, process.env.BITBUCKET_APP_PASSWORD as string);
        debug.debug('Kubero Config: '+JSON.stringify(this.config));
    }

    public updateState() {
        this.pipelineStateList = [];
        this.appStateList = [];
        this.listPipelines().then(pl => {
            for (const pipeline of pl.items as IPipeline[]) {
                this.pipelineStateList.push(pipeline);

                for (const phase of pipeline.phases) {

                    if (phase.enabled == true) {
                        debug.log("Checking Namespace: "+pipeline.name+"-"+phase.name);
                        this.listAppsInNamespace(pipeline.name, phase.name)
                        .then(appsList => {
                            if (appsList) {
                                for (const app of appsList.items) {
                                    debug.log("added App to state: "+app.spec.name);
                                    this.appStateList.push(app.spec);
                                }
                            }
                        })
                        .catch(error => {
                            debug.log(error);
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
            await this.kubectl.setCurrentContext(context)
            .catch(error => {
                debug.debug(error);
            });
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
        this.updateState();

        this.kubectl.createEvent('Normal', 'Created', 'pipeline.created', 'created new pipeline: '+pipeline.name);

        // update agents
        this._io.emit('updatedPipelines', "created");
    }

    public async listPipelines(): Promise<IPipelineList> {
        debug.debug('listPipelines');
        let pipelines = await this.kubectl.getPipelinesList();
        const ret: IPipelineList = {
            items: new Array()
        }
        for (const pipeline of pipelines.items) {
            debug.debug('listed pipeline: '+pipeline.spec.name);
            ret.items.push(pipeline.spec);
        }
        return ret;
    }

    public async getPipeline(pipelineName: string) {
        debug.debug('getPipeline');

        let pipeline = await this.kubectl.getPipeline(pipelineName)
        .catch(error => {
            debug.log(error);
        });

        if (pipeline) {
            return pipeline.spec;
        }
    }

    // delete a pipeline and all its namespaces/phases
    public deletePipeline(pipelineName: string) {
        debug.debug('deletePipeline: '+pipelineName);

        this.kubectl.getPipeline(pipelineName).then(async pipeline =>{
            if (pipeline) {
                await this.kubectl.deletePipeline(pipelineName);

                // TODO: lines not working, since object may still exist in the API
                this.updateState();
                this._io.emit('updatedPipelines', "deleted");
                this.kubectl.createEvent('Normal', 'Deleted', 'pipeline.deleted', 'deleted pipeline: '+pipelineName);
            }
        })
        .catch(error => {
            debug.debug(error);
        });

    }

    // create a new app in a specified pipeline and phase
    public async newApp(app: App) {
        debug.log('create App: '+app.name+' in '+ app.pipeline+' phase: '+app.phase + ' deploymentstrategy: '+app.deploymentstrategy);
        const contextName = this.getContext(app.pipeline, app.phase);
        if (contextName) {
            await this.kubectl.createApp(app, contextName);
            this.appStateList.push(app);

            this._io.emit('updatedApps', "created");
            this.kubectl.createEvent('Normal', 'Created', 'app.created', 'created new app: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
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
            this._io.emit('updatedApps', "updated");
            this.kubectl.createEvent('Normal', 'Updated', 'app.updated', 'updated app: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
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
            this.kubectl.createEvent('Normal', 'Deleted', 'app.deleted', 'deleted app: '+appName+' in '+ pipelineName+' phase: '+phaseName);
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
            this.kubectl.createEvent('Normal', 'Restarted', 'app.restarted', 'restarted app: '+appName+' in '+ pipelineName+' phase: '+phaseName);
        }
    }
/*
    public deployApp(pipelineName: string, phaseName: string, appName: string) {
        debug.debug('deploy App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
        this.kubectl.deployApp(pipelineName, phaseName, appName);
        this._io.emit('updatedApps', "deployed");
    }
*/

    public async listRepos(repoProvider: string) {
        debug.log('listRepos: '+repoProvider);

        switch (repoProvider) {
            case 'github':
                return this.githubApi.listRepos();
            case 'gitea':
                return this.giteaApi.listRepos();
            case 'gogs':
                return this.gogsApi.listRepos();
            case 'gitlab':
                return this.gitlabApi.listRepos();
            case 'bitbucket':
                return this.bitbucketApi.listRepos();
            case 'ondev':
            default:
                return {'error': 'unknown repo provider'};
        }
    }

    public async connectRepo(repoProvider: string, repoAddress: string) {
        debug.log('connectRepo: '+repoProvider+' '+repoAddress);

        switch (repoProvider) {
            case 'github':
                return this.githubApi.connectRepo(repoAddress);
            case 'gitea':
                return this.giteaApi.connectRepo(repoAddress);
            case 'gogs':
                return this.gogsApi.connectRepo(repoAddress);
            case 'gitlab':
                return this.gitlabApi.connectRepo(repoAddress);
            case 'bitbucket':
                return this.bitbucketApi.connectRepo(repoAddress);
            case 'ondev':
            default:
                return {'error': 'unknown repo provider'};
        }
    }

    public async handleWebhook(repoProvider: string, event: string, delivery: string, signature: string, body: any) {
        debug.log('handleWebhook');
        let webhook: boolean | IWebhook = false;
        switch (repoProvider) {
            case 'github':
                webhook = this.githubApi.getWebhook(event, delivery, signature, body);
                break;
            case 'gitea':
                webhook = this.giteaApi.getWebhook(event, delivery, signature, body);
                break;
            case 'gogs':
                webhook = this.gogsApi.getWebhook(event, delivery, signature, body);
                break;
            case 'gitlab':
                webhook = this.gitlabApi.getWebhook(event, delivery, signature, body);
                break;
            case 'bitbucket':
                webhook = this.bitbucketApi.getWebhook(event, delivery, body); // Bitbucket has no signature
                break;
            case 'ondev':
            default:
                break;
        }

        if (typeof webhook != 'boolean') {
            switch (webhook.event) {
                case 'push':
                    this.handleWebhookPush(webhook);
                    break;
                case 'pull_request':
                    this.handleWebhookPullRequest(webhook);
                    break;
                default:
                    debug.log('webhook event not handled: '+event);
                    break;
            }
        }
    }

    private async handleWebhookPush(webhook: IWebhook) {
        debug.log('handleWebhookPush');
        let apps = await this.getAppsByBranch(webhook.branch);

        for (const app of apps) {
            this.kubectl.createEvent('Normal', 'Pushed', 'pushed', 'pushed to branch: '+webhook.branch+' in '+ webhook.repo.ssh_url + ' for app: '+app.name + ' in pipeline: '+app.pipeline + ' phase: '+app.phase);
            this.restartApp(app.pipeline, app.phase, app.name);
        }
    }

    private async handleWebhookPullRequest(webhook: IWebhook) {
        debug.log('handleWebhookPullRequest');

        switch (webhook.action) {
            case 'opened':
            case 'reopened':
                this.createPRApp(webhook.branch, webhook.branch, webhook.repo.ssh_url)
                this.kubectl.createEvent('Normal', 'Opened', 'pr.opened', 'opened pull request: '+webhook.branch+' in '+ webhook.repo.ssh_url);
                break;
            case 'closed':
                this.deletePRApp(webhook.branch, webhook.branch, webhook.repo.ssh_url)
                this.kubectl.createEvent('Normal', 'Closed', 'pr.closed', 'closed pull request: '+webhook.branch+' in '+ webhook.repo.ssh_url);
                break;
            default:
                console.log('webhook pull request action not handled: '+webhook.action);
                break;
        }
    }

    public async listRepoBranches(repoProvider: string, repoB64: string ): Promise<string[]> {
        //return this.git.listRepoBranches(repo, repoProvider);
        let branches: Promise<string[]> = new Promise((resolve, reject) => {
            resolve([]);
        });

        const repo = Buffer.from(repoB64, 'base64').toString('ascii');

        switch (repoProvider) {
            case 'github':
                branches = this.githubApi.getBranches(repo);
                break;
            case 'gitea':
                branches = this.giteaApi.getBranches(repo);
                break;
            case 'gogs':
                branches = this.gogsApi.getBranches(repo);
                break;
            case 'gitlab':
                branches = this.gitlabApi.getBranches(repo);
                break;
            case 'bitbucket':
                branches = this.bitbucketApi.getBranches(repo);
                break;
            case 'ondev':
            default:
                break;
        }

        return branches
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

    // creates a PR App in all Pipelines that have review apps enabled and the same ssh_url
    private async createPRApp(branch: string, title: string, ssh_url: string) {
        debug.log('createPRApp');
        let pipelines = await this.listPipelines() as IPipelineList;

        for (const pipeline of pipelines.items) {

            if (pipeline.reviewapps &&
                pipeline.git.repository &&
                pipeline.git.repository.ssh_url === ssh_url) {

                debug.debug('found pipeline: '+pipeline.name);
                let pipelaneName = pipeline.name
                let phaseName = 'review';
                let websaveTitle = title.toLowerCase().replace(/[^a-z0-9-]/g, '-'); //TODO improve websave title

                let appOptions:IApp = {
                    name: websaveTitle,
                    pipeline: pipelaneName,
                    gitrepo: pipeline.git.repository,
                    buildpack: pipeline.buildpack.name,
                    deploymentstrategy: pipeline.deploymentstrategy,
                    phase: phaseName,
                    branch: branch,
                    autodeploy: true,
                    domain: websaveTitle+"."+pipeline.domain,
                    podsize: this.config.podSizeList[0], //TODO select from podsizelist
                    autoscale: false,
                    envVars: [], //TODO use custom env vars,
                    image: {
                        containerPort: 8080, //TODO use custom containerport
                        repository: pipeline.dockerimage, // FIXME: Maybe needs a lookup into buildpack
                        tag: "main",
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

    private logcolor(str: string) {
        let hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substring(2);
        }
        return color;
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
                color: this.logcolor(podName),
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
                debug.log('logs already running '+podName+' '+container);
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
                        /* TODO needs some improvements since it wont load web anymore
                        for (const initcontainer of pod.spec.initContainers) {
                            this.emitLogs(pipelineName, phaseName, appName, pod.metadata.name, initcontainer.name);
                        }
                        */
                    }
                }
            });
        }
    }

    public getRepositories() {
        let repositories = {
            github: false,
            gitea: false,
            gitlab: false,
            gogs: false,
            onedev: false,
            bitbucket: false,
            docker: true
        }

        if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
            repositories.github = true;
        }

        if (process.env.GITEA_PERSONAL_ACCESS_TOKEN) {
            repositories.gitea = true;
        }

        if (process.env.GITLAB_PERSONAL_ACCESS_TOKEN) {
            repositories.gitlab = true;
        }

        if (process.env.GOGS_PERSONAL_ACCESS_TOKEN) {
            repositories.gogs = true;
        }

        if (process.env.ONEDEV_PERSONAL_ACCESS_TOKEN) {
            repositories.onedev = true;
        }

        if (process.env.BITBUCKET_USERNAME && process.env.BITBUCKET_APP_PASSWORD) {
            repositories.bitbucket = true;
        }

        return repositories;
    }

    public getBuildpacks() {
        return this.config.buildpacks;
    }

    public getEvents(namespace: string) {
        return this.kubectl.getEvents(namespace);
    }
}