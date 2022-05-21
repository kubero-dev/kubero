import debug from 'debug';
debug('app:kubectl')

import {KubeConfig} from '@kubernetes/client-node'

export class Kubectl {
   
    constructor() {
        const kc = new KubeConfig();

        if (process.env.KUBECONFIG_BASE64) {
            debug.log("load from base64");
            let buff = Buffer.from(process.env.KUBECONFIG_BASE64, 'base64');
            const kubeconfig = buff.toString('ascii');
            kc.loadFromString(kubeconfig);
        } else if(process.env.KUBECONFIG_PATH) { 
            debug.log("load from file");
            kc.loadFromFile(process.env.KUBECONFIG_PATH);
        } else if (process.env.KUBERNETES_SERVICE_TOKEN){
            debug.log("load from options");
            kc.loadFromOptions({
                token: process.env.KUBERNETES_SERVICE_TOKEN,
                username: process.env.KUBERNETES_USER,
                password: process.env.KUBERNETES_PASSWORD,
                caFile: process.env.KUBERNETES_CA_CERT,
                server: process.env.KUBERNETES_SERVICE_HOST + ':' + process.env.KUBERNETES_SERVICE_PORT
            });
        } else{
            debug.log("load from cluster");
            try {
                kc.loadFromCluster();
            } catch (error) {
                console.log("error loading from cluster");
                console.log(error);
            }
        }
    }
   
    list() {
        console.log("list");
    }
}