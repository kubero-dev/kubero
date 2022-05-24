import debug from 'debug';
debug('app:kubectl')

import {KubeConfig} from '@kubernetes/client-node'

export class Kubectl {
    kc: KubeConfig;
   
    constructor() {
        this.kc = new KubeConfig();

        if (process.env.KUBECONFIG_BASE64) {
            debug.debug("load kubectl config from base64");
            let buff = Buffer.from(process.env.KUBECONFIG_BASE64, 'base64');
            const kubeconfig = buff.toString('ascii');
            this.kc.loadFromString(kubeconfig);
        } else if(process.env.KUBECONFIG_PATH) { 
            debug.debug("load kubectl config from file");
            this.kc.loadFromFile(process.env.KUBECONFIG_PATH);
        } else if (process.env.KUBERNETES_SERVICE_TOKEN){
            debug.debug("load kubectl config from options");
            this.kc.loadFromOptions({
                token: process.env.KUBERNETES_SERVICE_TOKEN,
                username: process.env.KUBERNETES_USER,
                password: process.env.KUBERNETES_PASSWORD,
                caFile: process.env.KUBERNETES_CA_CERT,
                server: process.env.KUBERNETES_SERVICE_HOST + ':' + process.env.KUBERNETES_SERVICE_PORT
            });
        } else{
            debug.log("load from cluster");
            try {
                this.kc.loadFromCluster();
            } catch (error) {
                console.log("error loading from cluster");
                console.log(error);
            }
        }
    }

    createNamespace(name: string) {
        console.log("create namespace");
    }
}