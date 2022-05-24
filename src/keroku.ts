import debug from 'debug';
debug('app:keroku')


import { Kubectl } from './kubectl';

export class Keroku {
    kubectl: Kubectl;
    constructor() {
        console.log("keroku");
        this.kubectl = new Kubectl();
    }

    newApp(name: string) {
        debug.debug('create newApp: '+name);
        this.kubectl.createNamespace(name);
    }
}