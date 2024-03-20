import debug from 'debug';
import { Server } from "socket.io";
import { IApp, IPipeline, IPipelineList, IKubectlAppList, IDeployKeyPair, IKubectlPipelineList, Workload, WorkloadContainer, IKubectlApp, ILoglines, IKuberoConfig, IMessage} from './types';
import { IPullrequest } from './git/types';
import { App, KubectlTemplate } from './modules/application';
import { Buildpack } from './modules/config';
import { Audit } from './modules/audit';
import { User } from './modules/auth';
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
import { use } from 'passport';

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
    private audit: Audit;
    private execStreams: {[key: string]: {websocket: WebSocket, stream: any}} = {};

    constructor(io: Server, audit: Audit) {
        this.config = this.loadConfig(process.env.KUBERO_CONFIG_PATH as string || './config.yaml');
        this.kubectl = new Kubectl(this.config);
        this._io = io;

        this.giteaApi = new GiteaApi(process.env.GITEA_BASEURL as string, process.env.GITEA_PERSONAL_ACCESS_TOKEN as string);
        this.gogsApi = new GogsApi(process.env.GOGS_BASEURL as string, process.env.GOGS_PERSONAL_ACCESS_TOKEN as string);
        this.githubApi = new GithubApi(process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string);
        this.gitlabApi = new GitlabApi(process.env.GITLAB_BASEURL as string, process.env.GITLAB_PERSONAL_ACCESS_TOKEN as string);
        this.bitbucketApi = new BitbucketApi(process.env.BITBUCKET_USERNAME as string, process.env.BITBUCKET_APP_PASSWORD as string);
        debug.debug('Kubero Config: '+JSON.stringify(this.config));

        this.audit = audit;


        this._io.on('connection', client => {
            client.on('terminal', (data: any) => {
                //console.log('terminal input', data.data);
                //console.log('ws.OPEN', ws.readyState == ws.OPEN);
                //console.log(ws.url);
                //console.log(ws.eventNames());
                //execStream.write(data.data);
                if (this.execStreams[data.room]) {
                    this.execStreams[data.room].stream.write(data.data);
                }
                //this.execStreams[data.room].stream.write(data.data);
            }
            )}
        );
    }

    public getKubernetesVersion() {
        if (this.kubectl.kubeVersion) {
            return this.kubectl.kubeVersion.gitVersion;
        } else {
            return 'unknown';
        }
    }

    public updateState() {
        this.pipelineStateList = [];
        this.appStateList = [];
        this.listPipelines().then(pl => {
            for (const pipeline of pl.items as IPipeline[]) {
                this.pipelineStateList.push(pipeline);

                for (const phase of pipeline.phases) {

                    if (phase.enabled == true) {
                        debug.log("🔁 Loading Namespace: "+pipeline.name+"-"+phase.name);
                        this.listAppsInNamespace(pipeline.name, phase.name)
                        .then(appsList => {
                            if (appsList) {
                                for (const app of appsList.items) {
                                    debug.log("🔁 Loading App: "+app.spec.name);
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
    public async newPipeline(pipeline: IPipeline, user: User) {
        debug.debug('create Pipeline: '+pipeline.name);

        if ( process.env.KUBERO_READONLY == 'true'){
            console.log('KUBERO_READONLY is set to true, not deleting app');
            return;
        }

        // Create the Pipeline CRD
        await this.kubectl.createPipeline(pipeline);
        this.updateState();

        this.kubectl.createEvent('Normal', 'Created', 'pipeline.created', 'created new pipeline: '+pipeline.name);
        this.audit?.log({
            user: user.username,
            severity: 'normal',
            action: 'create',
            namespace: '',
            phase: '',
            app: '',
            pipeline: pipeline.name,
            resource: 'pipeline',
            message: 'created new pipeline: '+pipeline.name
        });

        // update agents
        const message = {
            'action': 'created',
            'pipelineName':pipeline.name,
            'data': {
                'pipeline': pipeline
            }
        } as IMessage;
        this._io.emit('updatedPipelines', message);
    }

    // updates a new pipeline in the same namespace as the kubero app
    public async updatePipeline(pipeline: IPipeline, resourceVersion: string, user: User) {
        debug.debug('update Pipeline: '+pipeline.name);

        if ( process.env.KUBERO_READONLY == 'true'){
            console.log('KUBERO_READONLY is set to true, not deleting app');
            return;
        }

        const currentPL = await this.kubectl.getPipeline(pipeline.name)
        .catch(error => {
            debug.log(error);
        });

        pipeline.git.keys.priv = currentPL?.spec.git.keys.priv;
        pipeline.git.keys.pub = currentPL?.spec.git.keys.pub;

        // Create the Pipeline CRD
        await this.kubectl.updatePipeline(pipeline, resourceVersion);
        this.updateState();

        this.kubectl.createEvent('Normal', 'Updated', 'pipeline.updated', 'updated pipeline: '+pipeline.name);
        this.audit?.log({
            user: user.username,
            severity: 'normal',
            action: 'update',
            namespace: '',
            phase: '',
            app: '',
            pipeline: pipeline.name,
            resource: 'pipeline',
            message: 'updated pipeline: '+pipeline.name
        });

        // update agents
        const message = {
            'action': 'updated',
            'pipelineName':pipeline.name,
            'data': {
                'pipeline': pipeline
            }
        } as IMessage;
        this._io.emit('updatedPipelines', message);
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

    public async getPipeline(pipelineName: string): Promise<IPipeline | undefined>{
        debug.debug('getPipeline');

        let pipeline = await this.kubectl.getPipeline(pipelineName)
        .catch(error => {
            debug.log(error);
            return undefined;
        });

        if (pipeline) {
            if (pipeline.spec.buildpack) {
                pipeline.spec.buildpack.fetch.securityContext = Buildpack.SetSecurityContext(pipeline.spec.buildpack.fetch.securityContext);
                pipeline.spec.buildpack.build.securityContext = Buildpack.SetSecurityContext(pipeline.spec.buildpack.build.securityContext);
                pipeline.spec.buildpack.run.securityContext = Buildpack.SetSecurityContext(pipeline.spec.buildpack.run.securityContext);
            }

            if (pipeline.metadata && pipeline.metadata.resourceVersion) {
                pipeline.spec.resourceVersion = pipeline.metadata.resourceVersion;
            }

            delete pipeline.spec.git.keys.priv
            delete pipeline.spec.git.keys.pub
            return pipeline.spec;
        }
    }

    // delete a pipeline and all its namespaces/phases
    public deletePipeline(pipelineName: string, user: User) {
        debug.debug('deletePipeline: '+pipelineName);

        if ( process.env.KUBERO_READONLY == 'true'){
            console.log('KUBERO_READONLY is set to true, not deleting app');
            return;
        }

        this.kubectl.getPipeline(pipelineName).then(async pipeline =>{
            if (pipeline) {
                await this.kubectl.deletePipeline(pipelineName);

                await new Promise(resolve => setTimeout(resolve, 5000)); // needs some extra time to delete the namespace
                this.updateState();
                const message = {
                    'action': 'deleted',
                    'pipelineName':pipelineName,
                    'data': {
                        'pipeline': pipeline
                    }
                } as IMessage;
                this._io.emit('updatedPipelines', message);
                this.kubectl.createEvent('Normal', 'Deleted', 'pipeline.deleted', 'deleted pipeline: '+pipelineName);
                this.audit?.log({
                    user: user.username,
                    severity: 'normal',
                    action: 'delete',
                    namespace: '',
                    phase: '',
                    app: '',
                    pipeline: pipelineName,
                    resource: 'pipeline',
                    message: 'deleted pipeline: '+pipelineName
                });
            }
        })
        .catch(error => {
            debug.debug(error);
        });

    }

    // create a new app in a specified pipeline and phase
    public async newApp(app: App, user: User) {
        debug.log('create App: '+app.name+' in '+ app.pipeline+' phase: '+app.phase + ' deploymentstrategy: '+app.deploymentstrategy);

        if ( process.env.KUBERO_READONLY == 'true'){
            console.log('KUBERO_READONLY is set to true, not creating app');
            return;
        }

        const contextName = this.getContext(app.pipeline, app.phase);
        if (contextName) {
            await this.kubectl.createApp(app, contextName);

            if (app.deploymentstrategy == 'git' && (app.buildstrategy == 'dockerfile' || app.buildstrategy == 'nixpacks')){
                this.triggerImageBuild(app.pipeline, app.phase, app.name);
            }
            this.appStateList.push(app);
            const message = {
                'action': 'created',
                'pipelineName':app.pipeline,
                'phaseName':app.phase,
                'appName': app.name,
                'data': {
                    'app': app
                }
            } as IMessage;

            this._io.emit('updatedApps', message);
            this.kubectl.createEvent('Normal', 'Created', 'app.created', 'created new app: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
            this.audit?.log({
                user: user.username,
                severity: 'normal',
                action: 'create',
                namespace: app.name+'-'+app.phase,
                phase: app.phase,
                app: app.name,
                pipeline: app.pipeline,
                resource: 'app',
                message: 'created new app: '+app.name+' in '+ app.pipeline+' phase: '+app.phase
            });

        }

    }

    // update an app in a pipeline and phase
    public async updateApp(app: App, resourceVersion: string, user: User) {
        debug.debug('update App: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
        await this.setContext(app.pipeline, app.phase);

        if ( process.env.KUBERO_READONLY == 'true'){
            console.log('KUBERO_READONLY is set to true, not deleting app');
            return;
        }

        if (app.deploymentstrategy == 'git' && (app.buildstrategy == 'dockerfile' || app.buildstrategy == 'nixpacks')){
            this.triggerImageBuild(app.pipeline, app.phase, app.name);
        }

        const contextName = this.getContext(app.pipeline, app.phase);
        if (contextName) {
            await this.kubectl.updateApp(app, resourceVersion, contextName);
            // IMPORTANT TODO : Update this.appStateList !!
            this.kubectl.createEvent('Normal', 'Updated', 'app.updated', 'updated app: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
            this.audit?.log({
                user: user.username,
                severity: 'normal',
                action: 'update',
                namespace: app.name+'-'+app.phase,
                phase: app.phase,
                app: app.name,
                pipeline: app.pipeline,
                resource: 'app',
                message: 'updated app: '+app.name+' in '+ app.pipeline+' phase: '+app.phase
            });
            const message = {
                'action': 'updated',
                'pipelineName':app.pipeline,
                'phaseName':app.phase,
                'appName': app.name,
                'data': app
            } as IMessage;
            this._io.emit('updatedApps', message);
        }
    }

    // delete a app in a pipeline and phase
    public async deleteApp(pipelineName: string, phaseName: string, appName: string, user: User) {
        debug.debug('delete App: '+appName+' in '+ pipelineName+' phase: '+phaseName);

        if ( process.env.KUBERO_READONLY == 'true'){
            console.log('KUBERO_READONLY is set to true, not deleting app');
            return;
        }

        const contextName = this.getContext(pipelineName, phaseName);
        if (contextName) {
            await this.kubectl.deleteApp(pipelineName, phaseName, appName, contextName);
            this.removeAppFromState(pipelineName, phaseName, appName);
            this.kubectl.createEvent('Normal', 'Deleted', 'app.deleted', 'deleted app: '+appName+' in '+ pipelineName+' phase: '+phaseName);
            this.audit?.log({
                user: user.username,
                severity: 'normal',
                action: 'delete',
                namespace: appName+'-'+phaseName,
                phase: phaseName,
                app: appName,
                pipeline: pipelineName,
                resource: 'app',
                message: 'deleted app: '+appName+' in '+ pipelineName+' phase: '+phaseName
            });
            const message = {
                'action': 'deleted',
                'pipelineName':pipelineName,
                'phaseName':pipelineName,
                'appName': appName
            } as IMessage;
            this._io.emit('updatedApps', message);
        }
    }

    private removeAppFromState(pipelineName: string, phaseName: string, appName: string) {
        //console.log('removeAppFromState: '+appName+' in '+ pipelineName+' phase: '+phaseName);

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

    public async getTemplate(pipelineName: string, phaseName: string, appName: string ) {
        const app = await this.getApp(pipelineName, phaseName, appName);
        const a = app?.body as IKubectlApp;
        let t =  new KubectlTemplate(a.spec as IApp);

        //Convert template to Yaml
        const template = YAML.stringify(t, {indent: 4, resolveKnownTags: true});

        return template
    }

    // list all apps in a pipeline
    public async getPipelineWithApps(pipelineName: string) {
        debug.debug('listApps in '+pipelineName);
        await this.kubectl.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
        const kpipeline = await this.kubectl.getPipeline(pipelineName);

        if (!kpipeline.spec || !kpipeline.spec.git || !kpipeline.spec.git.keys) {
            return;
        }

        delete kpipeline.spec.git.keys.priv
        delete kpipeline.spec.git.keys.pub

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

    public restartApp(pipelineName: string, phaseName: string, appName: string, user: User) {
        debug.debug('restart App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
        const contextName = this.getContext(pipelineName, phaseName);
        if (contextName) {
            this.kubectl.restartApp(pipelineName, phaseName, appName, 'web', contextName);
            this.kubectl.restartApp(pipelineName, phaseName, appName, 'worker', contextName);

            let message = {
                'action': 'restarted',
                'pipelineName':pipelineName,
                'phaseName':phaseName,
                'appName': appName
            } as IMessage;
            this._io.emit('updatedApps', message);
            this.kubectl.createEvent('Normal', 'Restarted', 'app.restarted', 'restarted app: '+appName+' in '+ pipelineName+' phase: '+phaseName);
            this.audit?.log({
                user: user.username,
                severity: 'normal',
                action: 'restart',
                namespace: appName+'-'+phaseName,
                phase: phaseName,
                app: appName,
                pipeline: pipelineName,
                resource: 'app',
                message: 'restarted app: '+appName+' in '+ pipelineName+' phase: '+phaseName
            });
        }
    }

    private rebuildApp(app: IApp) {
        debug.debug('rebuild App: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
        const contextName = this.getContext(app.pipeline, app.phase);
        if (contextName) {

            if ( app.deploymentstrategy == 'docker' || app.buildstrategy == undefined || app.buildstrategy == 'plain'){
                this.kubectl.restartApp(app.pipeline, app.phase, app.name, 'web', contextName);
                this.kubectl.restartApp(app.pipeline, app.phase, app.name, 'worker', contextName);
            } else {
                // rebuild for buildstrategy git/dockerfile or git/nixpacks
                this.triggerImageBuild(app.pipeline, app.phase, app.name);
            }

            let message = {
                'action': 'rebuild',
                'pipelineName':app.pipeline,
                'phaseName':app.phase,
                'appName': app.name,
                'data': {
                    'app': app
                }
            } as IMessage;
            this._io.emit('updatedApps', message);
            this.kubectl.createEvent('Normal', 'Rebuild', 'app.restarted', 'restarted app: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
            this.audit?.log({
                user: '',
                severity: 'normal',
                action: 'restart',
                namespace: app.name+'-'+app.phase,
                phase: app.phase,
                app: app.name,
                pipeline: app.pipeline,
                resource: 'app',
                message: 'restarted app: '+app.name+' in '+ app.pipeline+' phase: '+app.phase
            });
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
            case 'onedev':
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
            case 'onedev':
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
            case 'onedev':
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
            const message = {
                'action': 'pushed',
                'pipelineName':app.pipeline,
                'phaseName':app.phase,
                'appName': app.name,
                'data': {
                    'app': app,
                    'webhook': webhook
                }
            } as IMessage;
            this._io.emit('updatedApps', message);
            this.kubectl.createEvent('Normal', 'Pushed', 'pushed', 'pushed to branch: '+webhook.branch+' in '+ webhook.repo.ssh_url + ' for app: '+app.name + ' in pipeline: '+app.pipeline + ' phase: '+app.phase);
            this.audit?.log({
                user: '',
                severity: 'normal',
                action: 'push',
                namespace: app.name+'-'+app.phase,
                phase: app.phase,
                app: app.name,
                pipeline: app.pipeline,
                resource: 'app',
                message: 'pushed to branch: '+webhook.branch+' in '+ webhook.repo.ssh_url + ' for app: '+app.name + ' in pipeline: '+app.pipeline + ' phase: '+app.phase
            });
            this.rebuildApp(app);
        }
    }

    private async handleWebhookPullRequest(webhook: IWebhook) {
        debug.log('handleWebhookPullRequest');

        switch (webhook.action) {
            case 'opened':
            case 'reopened':
                this.createPRApp(webhook.branch, webhook.branch, webhook.repo.ssh_url, undefined); // "undefined" will create the app in all pipelines
                break;
            case 'closed':
                this.deletePRApp(webhook.branch, webhook.branch, webhook.repo.ssh_url)
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
            case 'onedev':
            default:
                break;
        }

        return branches
    }


    public async listRepoPullrequests(repoProvider: string, repoB64: string ): Promise<IPullrequest[]> {
        //return this.git.listRepoBranches(repo, repoProvider);
        let pulls: Promise<IPullrequest[]> = new Promise((resolve, reject) => {
            resolve([]);
        });

        const repo = Buffer.from(repoB64, 'base64').toString('ascii');

        switch (repoProvider) {
            case 'github':
                pulls = this.githubApi.getPullrequests(repo);
                break;
            case 'gitea':
                pulls = this.giteaApi.getPullrequests(repo);
                break;
            case 'gogs':
                pulls = this.gogsApi.getPullrequests(repo);
                break;
            case 'gitlab':
                pulls = this.gitlabApi.getPullrequests(repo);
                break;
            case 'bitbucket':
                pulls = this.bitbucketApi.getPullrequests(repo);
                break;
            case 'onedev':
            default:
                break;
        }

        return pulls
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
    private async createPRApp(branch: string, title: string, ssh_url: string, pipelineName: string | undefined) {
        debug.log('createPRApp: ', branch, title, ssh_url);
        let pipelines = await this.listPipelines() as IPipelineList;

        for (const pipeline of pipelines.items) {
            console.log(pipeline.git.repository?.ssh_url, ssh_url);
            console.log(pipeline.reviewapps);

            if (pipeline.reviewapps &&
                pipeline.git.repository &&
                pipeline.git.repository.ssh_url === ssh_url) {

                if (pipelineName && pipelineName != pipeline.name) {
                    continue;
                }

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
                    buildstrategy: 'plain', // TODO: use buildstrategy from pipeline 
                    phase: phaseName,
                    branch: branch,
                    autodeploy: true,
                    domain: websaveTitle+"."+pipeline.domain,
                    podsize: this.config.podSizeList[0], //TODO select from podsizelist
                    autoscale: false,
                    envVars: [], //TODO use custom env vars,
                    extraVolumes: [], //TODO Not sure how to handlle extra Volumes on PR Apps
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
                                host: websaveTitle+"."+pipeline.domain,
                                paths: [
                                    {
                                        path: "/",
                                        pathType: "Prefix"
                                    }
                                ]
                            }
                        ],
                        tls: []
                    }


                }
                let app = new App(appOptions);

                const user = {
                    username: 'unknown'
                } as User;

                this.newApp(app, user);
                this.kubectl.createEvent('Normal', 'Opened', 'pr.opened', 'opened pull request: '+branch+' in '+ ssh_url);
                this.audit?.log({
                    user: user.username,
                    severity: 'normal',
                    action: 'pr.opened',
                    namespace: app.name+'-'+app.phase,
                    phase: app.phase,
                    app: app.name,
                    pipeline: app.pipeline,
                    resource: 'app',
                    message: 'opened pull request: '+branch+' in '+ ssh_url
                });
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

                    const user = {
                        username: 'unknown'
                    } as User;

                    this.deleteApp(app.pipeline, app.phase, websaveTitle, user);
                    this.kubectl.createEvent('Normal', 'Closed', 'pr.closed', 'closed pull request: '+branch+' in '+ ssh_url);
                    this.audit?.log({
                        user: user.username,
                        severity: 'normal',
                        action: 'pr.closed',
                        namespace: app.name+'-'+app.phase,
                        phase: app.phase,
                        app: app.name,
                        pipeline: app.pipeline,
                        resource: 'app',
                        message: 'closed pull request: '+branch+' in '+ ssh_url
                    });
            }
        }
    }

    // Loads the Kubero config from the local config file
    private loadConfig(path:string): IKuberoConfig {
        try {
            let config = YAML.parse(fs.readFileSync(path, 'utf8')) as IKuberoConfig;

            if (!config.clusterissuer) {
                config.clusterissuer = 'letsencrypt-prod';
            }

            // backward compatibility. Add default if template does not exist
            if (!config.templates) {
                config.templates = {
                    enabled: true,
                    catalogs: [
                        {
                            name: 'Kubero',
                            description: 'Kubero Templates',
                            templateBasePath: 'https://raw.githubusercontent.com/kubero-dev/kubero/main/services/',
                            index: {
                                url: 'https://raw.githubusercontent.com/kubero-dev/templates/main/index.json',
                                format: 'json',
                            }
                        }
                    ]
                };
            }

            // override env vars with config values
            if (config.kubero) {
                if (config.kubero.namespace && process.env.KUBERO_NAMESPACE === undefined) {
                    process.env.KUBERO_NAMESPACE = config.kubero.namespace;
                }
                if (config.kubero.readonly && process.env.KUBERO_READONLY === undefined) {
                    process.env.KUBERO_READONLY = config.kubero.readonly.toString();
                }
            }

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

    public getConsoleEnabled(){
        if (this.config.kubero?.console?.enabled == undefined) {
            return false;
        }
        return this.config.kubero?.console?.enabled;
    }

    public async execInContainer(pipelineName: string, phaseName: string, appName: string, podName: string, containerName: string, command: string, user: User) {
        console.log(this.config.kubero?.console.enabled)
        if (this.config.kubero?.console.enabled != true) {
            console.log('Warning: console is nost set or disabled in config');
            return;
        }
        const contextName = this.getContext(pipelineName, phaseName);
        if (contextName) {
            const streamname = `${pipelineName}-${phaseName}-${appName}-${podName}-${containerName}-terminal`;

            if ( process.env.KUBERO_READONLY == 'true'){
                console.log('KUBERO_READONLY is set to true, not deleting app');
                return;
            }

            if ( this.execStreams[streamname] ) {
                if (this.execStreams[streamname].websocket.readyState == this.execStreams[streamname].websocket.OPEN) {
                    console.log('execInContainer: execStream already running');
                    return;
                } else {
                    console.log('CLOSED', this.execStreams[streamname].websocket.CLOSED)
                    console.log('execInContainer: execStream already running but not open, deleting :', this.execStreams[streamname].websocket.readyState);
                    delete this.execStreams[streamname];

                    // wait a bit to make sure the stream is closed
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }

            const execStream = new Stream.PassThrough();

            const namespace = pipelineName+'-'+phaseName;
            const ws =  await this.kubectl.execInContainer(namespace, podName, containerName, command, execStream)
            .catch(error => {
                console.log(error);
                return;
            });

            if (!ws || ws.readyState != ws.OPEN) {
                console.log('execInContainer: ws is undefined or not open');
                return;
            }

            let stream = {
                websocket: ws as unknown as WebSocket,
                stream: execStream
            };
            this.execStreams[streamname] = stream;

            // sending the terminal output to the client
            ws.on('message', (data: Buffer) => {
                this._io.to(streamname).emit('consoleresponse', data.toString())
            });
        }
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

                this.kubectl.log.log(namespace, podName, container, logStream, {follow: true, tailLines: 0, pretty: false, timestamps: false})
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

    public async getLogsHistory(pipelineName: string, phaseName: string, appName: string, container: string) {
        const contextName = this.getContext(pipelineName, phaseName);
        const namespace = pipelineName+'-'+phaseName;

        let loglines: ILoglines[] = [];
        if (contextName) {
            const pods = await this.kubectl.getPods(namespace, contextName);
            for (const pod of pods) {

                if (pod.metadata?.name?.startsWith(appName)) {
                    if (container == 'web') {
                        for (const container of pod.spec?.containers || []) {
                            const ll = await this.fetchLogs(namespace, pod.metadata.name, container.name, pipelineName, phaseName, appName)
                            loglines = loglines.concat(ll);
                        }
                    } else if (container == 'builder' || container == 'fetcher') {
                        const ll = await this.fetchLogs(namespace, pod.metadata.name, "kuberoapp-"+container, pipelineName, phaseName, appName)
                        loglines = loglines.concat(ll);
                    } else {
                        // leace the loglines empty
                        console.log('unknown container: '+container);
                    }
                }
            }
        }
        return loglines;
    }

    private async fetchLogs(namespace: string, podName: string, containerName: string, pipelineName: string, phaseName: string, appName: string): Promise<ILoglines[]> {
        let loglines: ILoglines[] = [];

        const logStream = new Stream.PassThrough();
        let logs: String = '';
        logStream.on('data', (chunk: any) => {
            //console.log(chunk.toString());
            logs += chunk.toString();
        });

        console.log('getting logs for '+podName+' '+containerName);
        try {
            await this.kubectl.log.log(namespace, podName, containerName, logStream, {follow: false, tailLines: 80, pretty: false, timestamps: true})
        } catch (error) {
            console.log("error getting logs for "+podName+" "+containerName);
            return [];
        }
        
        // sleep for 1 second to wait for all logs to be collected
        await new Promise(r => setTimeout(r, 300));

        // split loglines into array
        const loglinesArray = logs.split('\n').reverse();
        for (const logline of loglinesArray) {
            if (logline.length > 0) {
                // split after first whitespace
                const loglineArray = logline.split(/(?<=^\S+)\s/);
                const loglineDate = new Date(loglineArray[0]);
                const loglineText = loglineArray[1];
            
                loglines.push({
                    id: uuidv4(),
                    time: loglineDate.getTime(),
                    pipeline: pipelineName,
                    phase: phaseName,
                    app: appName,
                    pod: podName,
                    podID: podName.split('-')[3]+'-'+podName.split('-')[4],
                    container: containerName,
                    color: this.logcolor(podName),
                    log: loglineText
                });
            }
        }

        return loglines;
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
        let buildpackList: Buildpack[] = [];
        for (const buildpack of this.config.buildpacks) {
            const b = new Buildpack(buildpack);
            buildpackList.push(b);
        }

        return buildpackList;
    }

    public getEvents(namespace: string) {
        return this.kubectl.getEvents(namespace);
    }

    public getPodUptime(pipelineName: string, phaseName: string) {
        const namespace = pipelineName+'-'+phaseName;
        return this.kubectl.getPodUptimes(namespace);
    }

    public getPodMetrics(pipelineName: string, phaseName: string, appName: string) {
        const namespace = pipelineName+'-'+phaseName;
        return this.kubectl.getPodMetrics(namespace, appName);
    }

    public getNodeMetrics() {
        return this.kubectl.getNodeMetrics();
    }

    public getIngressClasses() {
        return this.kubectl.getIngressClasses();
    }

    public getStorageglasses() {
        return this.kubectl.getStorageglasses();
    }

    public async startScan(pipeline: string, phase: string, appName: string) {
        const contextName = this.getContext(pipeline, phase);
        const namespace = pipeline+'-'+phase;


        const appresult = await this.getApp(pipeline, phase, appName)

        const app = appresult?.body as IKubectlApp;


        if (app?.spec?.deploymentstrategy === 'git' && app?.spec?.buildstrategy === 'plain') {
        //if (app?.spec?.deploymentstrategy === 'git') {

            if (app?.spec.gitrepo?.clone_url) {
                if (contextName) {
                    this.kubectl.setCurrentContext(contextName);
                    this.kubectl.createScanRepoJob(namespace, appName, app.spec.gitrepo.clone_url, app.spec.branch);
                }
            } else {
                debug.log('no git repo found to run scan');
            }
        } else {
            if (contextName) {
                this.kubectl.setCurrentContext(contextName);
                this.kubectl.createScanImageJob(namespace, appName, app.spec.image.repository, app.spec.image.tag);
            }
        }

        return {
            status: 'ok',
            message: 'scan started',
            deploymentstrategy: app?.spec?.deploymentstrategy,
            pipeline: pipeline,
            phase: phase,
            app: appName
        };
    }

    public async getScanResult(pipeline: string, phase: string, appName: string, logdetails: boolean) {
        const contextName = this.getContext(pipeline, phase);
        const namespace = pipeline+'-'+phase;

        let scanResult = {
            status: 'error',
            message: 'unknown error',
            deploymentstrategy: '',
            pipeline: pipeline,
            phase: phase,
            app: appName,
            namespace: namespace,
            logsummary: {},
            logs: {},
            logPod: ''
        }


        const appresult = await this.getApp(pipeline, phase, appName)

        const app = appresult?.body as IKubectlApp;

        const logPod = await this.kubectl.getLatestPodByLabel(namespace, `vulnerabilityscan=${appName}`);

        if (!logPod.name) {
            scanResult.status = 'error'
            scanResult.message = 'no vulnerability scan pod found'
            return scanResult;
        }

        let logs = '';
        if (contextName) {
            this.kubectl.setCurrentContext(contextName);
            logs = await this.kubectl.getVulnerabilityScanLogs(namespace, logPod.name);
        }

        if (!logs) {
            scanResult.status = 'running'
            scanResult.message = 'no vulnerability scan logs found'
            return scanResult;
        }

        const logsummary = this.getVulnSummary(logs);

        scanResult.status = 'ok'
        scanResult.message = 'vulnerability scan result'
        scanResult.deploymentstrategy = app?.spec?.deploymentstrategy
        scanResult.logsummary = logsummary
        scanResult.logPod = logPod


        if (logdetails) {
            scanResult.logs = logs;
        }

        return scanResult;
    }

    private getVulnSummary(logs: any) {
        let summary = {
            total: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            unknown: 0
        }

        if (!logs || !logs.Results) {
            console.log(logs);

            console.log('no logs found or not able to parse results');
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

    public async triggerImageBuild(pipeline: string, phase: string, appName: string) {
        const contextName = this.getContext(pipeline, phase);
        const namespace = pipeline+'-'+phase;

        const appresult = await this.getApp(pipeline, phase, appName)


        const app = appresult?.body as IKubectlApp;
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

        // TODO: Make image configurable
        const registry = process.env.KUBERO_BUILD_REGISTRY || 'registry.kubero.svc.cluster.local:5000';
        const image = `${registry}/${pipeline}/${appName}`;

        console.log('Build image: ', image);

        const timestamp = new Date().getTime();
        if (contextName) {
            this.kubectl.setCurrentContext(contextName);
            this.kubectl.createBuildImageJob(
                namespace,                      // namespace
                appName,                        // app
                repo,                           // gitrepo
                app.spec.branch,                // branch
                image,                          // image
                app.spec.branch+"-"+timestamp,  // tag // TODO : use a git reference here instead of timestamp
                dockerfilePath                  // dockerfile
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

    public async getTemplateConfig() {
        return this.config.templates;
    }

    public async getTemplateBasePath(catalogId: number) {
        return this.config.templates.catalogs[catalogId].templateBasePath;
    }

    public getTemplateEnabled() {
        return this.config.templates.enabled;
    }

    public getClusterIssuer() {
        return this.config.clusterissuer;
    }

    public deployApp(pipelineName: string, phaseName: string, appName: string, tag: string) {
        debug.debug('deploy App: '+appName+' in '+ pipelineName+' phase: '+phaseName);

        const contextName = this.getContext(pipelineName, phaseName);
        const namespace = pipelineName+'-'+phaseName;

        if (contextName) {
            this.kubectl.setCurrentContext(contextName);
            this.kubectl.deployApp(namespace, appName, tag);
            this._io.emit('updatedApps', {
                'action': 'deployed', 
                'data': {
                    'name': appName, 
                    'pipeline': pipelineName, 
                    'phase': phaseName
                }});
        }
    }

    public async getPods(pipelineName: string, phaseName: string, appName: string): Promise<Workload[]> {
        const contextName = this.getContext(pipelineName, phaseName);
        const namespace = pipelineName+'-'+phaseName;

        let workloads: Workload[] = [];

        if (contextName) {
            this.kubectl.setCurrentContext(contextName);
            const workload = await this.kubectl.getPods(namespace, contextName);
            //return workload
            for (const pod of workload) {
                // check if app label name starts with appName
                if (!pod.metadata?.generateName?.startsWith(appName+'-kuberoapp')) {
                    continue;
                }

                let workload = {
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

}