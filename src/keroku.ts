import debug from 'debug';
import { Server } from "socket.io";
import { IApp, IPipeline, IKubectlPipeline, IKubectlPipelineList} from './types';
import { App } from './types/application';
import { GithubApi } from './github/api';
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
        this.listPipelines().then(pipelinesList => {
            let pl  = pipelinesList as IKubectlPipelineList;
            for (const pipeline of pl.items) {
                
                for (const phase of pipeline.spec.phases) {

                    if (phase.enabled == true) {
                        debug.log("Checking Namespace: "+pipeline.spec.name+"-"+phase.name);
                        this.listAppsInNamespace(pipeline.spec.name+"-"+phase.name).then(appsList => {
                            
                            for (const app of appsList.items) {
                                debug.log("added App to state: "+app.spec.name);
                                this.appStateList.push(app.spec);
                            }
                        })
                    }
                }

            }
        }
        ).catch(error => {
            console.log(error);
        });
    }

    public async listAppsInNamespace(namespace: string) {
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
        for (const phase of pipeline.phases) {
            if (phase.enabled == true) {
                await this.kubectl.createNamespace(pipeline.name+"-"+phase.name);
            }
        }

        // create pipeline if enabled
        if (pipeline.reviewapps) {
            debug.debug('create reviewapp: '+pipeline.name);
            this.kubectl.createNamespace(pipeline.name+"-review");
        }

        // update agents
        this._io.emit('updatedPipelines', "created");
    }

    public async listPipelines() {
        debug.debug('listPipeline');
        let pipelines = await this.kubectl.getPipelinesList();
        return pipelines;
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
    public async newApp(app: App, envvars: { name: string; value: string; }[]) {
        debug.debug('create App: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
        await this.kubectl.createApp(app, envvars);
        this._io.emit('updatedApps', "created");
    }

    // update an app in a pipeline and phase
    public async updateApp(app: App, envvars: { name: string; value: string; }[], resourceVersion: string) {
        debug.debug('update App: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
        await this.kubectl.updateApp(app, envvars, resourceVersion);
        this._io.emit('updatedApps', "updated");
    }

    // delete a app in a pipeline and phase
    public async deleteApp(pipelineName: string, phaseName: string, appName: string) {
        debug.debug('delete App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
        await this.kubectl.deleteApp(pipelineName, phaseName, appName);
        this._io.emit('updatedApps', "deleted");
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

        if (process.env.GIT_DEPLOYMENTKEY_PRIVATE == undefined) {
            throw new Error("GIT_DEPLOYMENTKEY_PUBLIC is not defined");
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
}