import debug from 'debug';
import { Server } from "socket.io";
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

    public async newApp(appname: string, gitrepo: string, reviewapps: boolean) {
        debug.debug('create newApp: '+appname);
        //this.kubectl.getKubeVersion();
        await this.kubectl.createPipeline(appname, gitrepo, reviewapps);

        this.kubectl.createNamespace(appname+"-production");
        if (reviewapps) {
            debug.debug('create reviewapp: '+appname);
            this.kubectl.createNamespace(appname+"-review");
        }
        this._io.emit('updatedApps', "created");

    }

    public async listApps() {
        debug.debug('listApps');
        let apps = await this.kubectl.getPipelinesList();
        return apps;
    }

    public deleteApp(appname: string) {
        debug.debug('deleteApp: '+appname);

        this.kubectl.getPipeline(appname).then(async pipeline =>{
            if (pipeline) {
                await this.kubectl.deletePipeline(appname);
                this.kubectl.deleteNamespace(appname+"-production");
                this.kubectl.deleteNamespace(appname+"-review");
                this._io.emit('updatedApps', "deleted");
            }
        })
        .catch(error => {
            debug.debug(error);
        });
    }
}