import debug from 'debug';
import { Server } from "socket.io";
import { IApp, IPipeline} from './types';
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

    public async newPipeline(pipeline: IPipeline) {
        debug.debug('create newPipeline: '+pipeline.name);
        //this.kubectl.getKubeVersion();
        await this.kubectl.createPipeline(pipeline.name, pipeline.reviewapps);

        this.kubectl.createNamespace(pipeline.name+"-production");
        if (pipeline.reviewapps) {
            debug.debug('create reviewapp: '+pipeline.name);
            this.kubectl.createNamespace(pipeline.name+"-review");
        }
        this._io.emit('updatedPipelines', "created");

    }

    public async listPipelines() {
        debug.debug('listPipeline');
        let apps = await this.kubectl.getPipelinesList();
        return apps;
    }

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

    public async newApp(app: IApp) {
        debug.debug('create newApp: '+app.name+' in '+ app.pipeline+' phase: '+app.phase);
        await this.kubectl.createApp(app);
        this._io.emit('updatedApps', "created");
    }
}