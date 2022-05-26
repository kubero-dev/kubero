import debug from 'debug';
debug('app:keroku')


import { Kubectl } from './kubectl';

export class Keroku {
    kubectl: Kubectl;
    constructor() {
        console.log("keroku");
        this.kubectl = new Kubectl();
    }

    newApp(appname: string, gitrepo: string, reviewapps: boolean) {
        debug.debug('create newApp: '+appname);
        //this.kubectl.getKubeVersion();
        this.kubectl.createPipeline(appname, gitrepo, reviewapps);

        this.kubectl.createNamespace(appname+"-production");
        if (reviewapps) {
            debug.debug('create reviewapp: '+appname);
            this.kubectl.createNamespace(appname+"-review");
        }
    }
}