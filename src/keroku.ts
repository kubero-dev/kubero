import debug from 'debug';
import { Server } from "socket.io";
import { IApp, IPipeline, IKubectlPipeline} from './types';
import { App } from './types/application';
debug('app:keroku')

import { Kubectl } from './kubectl';

export class Keroku {
    public kubectl: Kubectl;
    private _io: Server;
    constructor(io: Server) {
        console.log("keroku");
        this.kubectl = new Kubectl();
        this._io = io;
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
        debug.debug('create newApp: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
        await this.kubectl.createApp(app, envvars);
        this._io.emit('updatedApps', "created");
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
}