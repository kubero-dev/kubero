import debug from 'debug';
import { Server } from "socket.io";
import { IApp, IPipeline, IKubectlAppList, IKubectlPipelineList} from './types';
import { App } from './types/application';
import { GithubApi } from './github/api';
import { IAddon } from './addons';
import * as crypto from "crypto"
import set from 'lodash.set';

debug('app:keroku')

import { Kubectl } from './kubectl';

export class Keroku {
    public kubectl: Kubectl;
    private _io: Server;
    private githubApi: GithubApi;
    private appStateList: IApp[] = [];

    constructor(io: Server) {
        console.log("keroku");
        this.kubectl = new Kubectl();
        this._io = io;

        this.githubApi = new GithubApi(process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string);
    }

    public init() {
        this.listPipelines().then(pl => {
            for (const pipeline of pl.items) {
                //console.log(pipeline)
                
                for (const phase of pipeline.phases) {

                    if (phase.enabled == true) {
                        debug.log("Checking Namespace: "+pipeline.name+"-"+phase.name);
                        this.listAppsInNamespace(pipeline.name+"-"+phase.name).then(appsList => {
                            
                            for (const app of appsList.items) {
                                debug.log("added App to state: "+app.spec.name);
                                this.appStateList.push(app.spec);
                            }
                        })
                    }
                }

                if (pipeline.reviewapps) {
                    debug.log("Checking Namespace: "+pipeline.name+"-review");
                    this.listAppsInNamespace(pipeline.name+"-review").then(appsList => {
                        for (const app of appsList.items) {
                            debug.log("added App to state: "+app.spec.name);
                            this.appStateList.push(app.spec);
                        }
                    })
                }
            }
        }
        ).catch(error => {
            console.log(error);
        });
    }

    public async getAppStateList(): Promise<IApp[]> {
        return this.appStateList;
    }

    public async listAppsInNamespace(namespace: string): Promise<IKubectlAppList> {
        debug.debug('listAppsInNamespace: '+namespace);
        let apps = await this.kubectl.getAppsList(namespace);
        return apps;
    }

    // creates a new pipeline in the same namespace as the kubero app
    public async newPipeline(pipeline: IPipeline) {
        debug.debug('create newPipeline: '+pipeline.name);

        //console.log(pipeline.phases);

        // Create the Pipeline CRD
        await this.kubectl.createPipeline(pipeline);

        //console.log(pipeline.phases);
        // create namespace for each phase
        let secretData = {
            'github.pub': Buffer.from(process.env.GIT_DEPLOYMENTKEY_PUBLIC as string).toString('base64'),
            'github': process.env.GIT_DEPLOYMENTKEY_PRIVATE_B64 as string,
        }
        for (const phase of pipeline.phases) {
            if (phase.enabled == true) {
                await this.kubectl.createNamespace(pipeline.name+"-"+phase.name);
                await this.kubectl.createSecret(pipeline.name+"-"+phase.name, "deployment-keys", secretData);
            }
        }

        // create pipeline if enabled
        if (pipeline.reviewapps) {
            debug.debug('create reviewapp: '+pipeline.name);
            await this.kubectl.createNamespace(pipeline.name+"-review");
            await this.kubectl.createSecret(pipeline.name+"-review", "deployment-keys", secretData);
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
            debug.log('pipeline: '+pipeline.spec.name);
            ret.items.push(pipeline.spec);
        }
        return ret;
    }

    // delete a pipeline and all its namespaces/phases
    public deletePipeline(appname: string) {
        debug.debug('deletePipeline: '+appname);

        this.kubectl.getPipeline(appname).then(async pipeline =>{
            if (pipeline) {
                await this.kubectl.deletePipeline(appname);
                this.kubectl.deleteNamespace(appname+"-production");
                this.kubectl.deleteNamespace(appname+"-review");
                this._io.emit('updatedPipelines', "deleted");
            }
        })
        .catch(error => {
            debug.debug(error);
        });
    }

    // create a new app in a specified pipeline and phase
    public async newApp(app: App) {
        debug.debug('create App: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
        await this.kubectl.createApp(app);
        this.appStateList.push(app);
        
        let namespace = app.pipeline+'-'+app.phase;
        this.createAddons(app.addons, namespace);
        this._io.emit('updatedApps', "created");
    }

    // update an app in a pipeline and phase
    public async updateApp(app: App, envvars: { name: string; value: string; }[], resourceVersion: string) {
        debug.debug('update App: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
        await this.kubectl.updateApp(app, envvars, resourceVersion);
        // IMPORTANT TODO : Update this.appStateList !!

        let namespace = app.pipeline+'-'+app.phase;
        //TODO: the addons are created even when they exist. This should be handled in a better way
        this.createAddons(app.addons, namespace);
        this._io.emit('updatedApps', "updated");
    }

    // delete a app in a pipeline and phase
    public async deleteApp(pipelineName: string, phaseName: string, appName: string) {
        debug.debug('delete App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
        await this.kubectl.deleteApp(pipelineName, phaseName, appName);
        this.removeAppFromState(pipelineName, phaseName, appName);
        this._io.emit('updatedApps', "deleted");
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

    // delete a app in a pipeline and phase
    public async getApp(pipelineName: string, phaseName: string, appName: string) {
        debug.debug('get App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
        let app = await this.kubectl.getApp(pipelineName, phaseName, appName);
        return app;
    }

    // list all apps in a pipeline
    public async listApps(pipelineName: string) {
        debug.debug('listApps in '+pipelineName);
        let kpipeline = await this.kubectl.getPipeline(pipelineName);

        let pipeline = kpipeline.spec
        //await pipeline.phases.forEach(async (phase, key) => { // does not work, wait for all iterations to finish
        await Promise.all(pipeline.phases.map(async (phase, key) => {

            console.log(phase.name)
            let apps = await this.kubectl.getAppsList(pipelineName+"-"+phase.name);
            
            pipeline.phases[key].apps = [];
            for (const app of apps.items) {
                pipeline.phases[key].apps.push(app.spec);
            }
            
        }));

        if (pipeline.reviewapps) {

            let review = {
                "enabled": true,
                "name": "review",
                "apps": Array()
            }

            let apps = await this.kubectl.getAppsList(pipelineName+"-review");
            for (const app of apps.items) {
                review.apps.push(app.spec);
            }

            pipeline.phases.unshift(review);

        }

        return pipeline;
    }

    public restartApp(pipelineName: string, phaseName: string, appName: string) {
        debug.debug('restart App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
        this.kubectl.restartApp(pipelineName, phaseName, appName);
        let message = {
            'action': 'restarted', 
            'pipeline':pipelineName, 
            'phase':phaseName, 
            'app': appName
        }
        this._io.emit('updatedApps', message);
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
        console.log('handleGithubWebhook');

        //https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
        let secret = process.env.GITHUB_WEBHOOK_SECRET as string;
        let hash = 'sha256='+crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex')
        if (hash === signature) {
            console.log('Github webhook signature is valid for event: '+delivery);

            switch (event) {
                case 'push':
                    this.handleGithubPush(body);
                    break;
                case 'pull_request':
                    this.handleGithubPullRequest(body);
                    break;
                default:
                    console.log('Github webhook event not handled: '+event);
                    break;
            }
            //console.log(body);
        } else {
            debug.log('ERROR: invalid signature for event: '+delivery);
            console.log(hash);
            console.log(signature);
        }
    }

    private async handleGithubPush(body: any) {
        console.log('handleGithubPush');
        let ref = body.ref
        let refs = ref.split('/')
        let branch = refs[refs.length - 1]
        let apps = await this.getAppsByBranch(branch);

        for (const app of apps) {
            this.restartApp(app.pipeline, app.phase, app.name);
        }
    }

    private async getAppsByBranch(branch: string) {
        console.log('getAppsByBranch: '+branch);
        let apps: IApp[] = [];
        for (const app of this.appStateList) {
            if (app.branch === branch) {
                apps.push(app);
            }
        }
        return apps;
    }

    private async handleGithubPullRequest(body: any) {
        console.log('handleGithubPullRequest');
        let pullRequest = body.pull_request;
        console.log(body.action);

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
        //console.log(pipelines.items);

        for (const pipeline of pipelines.items) {

            if (pipeline.spec.reviewapps && 
                pipeline.spec.github.repository && 
                pipeline.spec.github.repository.ssh_url === ssh_url) {
                
                console.log('found pipeline: '+pipeline.spec.name);
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
                    podsize: "small",
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

                }
                let app = new App(appOptions);
    
                this.newApp(app);
            }
        }
    }

    // delete a pr app in all pipelines that have review apps enabled and the same ssh_url
    private async deletePRApp(branch: string, title: string, ssh_url: string) {
        console.log('destroyPRApp');
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

    private async createAddons(addons: IAddon[], namespace: string) {
        for (const addon of addons) {
            //console.log(addon);
            //console.log('createAddon: '+addon.name);
            for (const field in addon.formfields) {
                console.log(addon.formfields[field]);

                let val = addon.formfields[field].default;
                
                if (addon.formfields[field].type === 'number') {
                    val = Number(val);
                }

                set(addon.crd, field, val);
            }

            console.log(addon.crd);
            this.kubectl.createAddon(addon, namespace);
        }
    }

}