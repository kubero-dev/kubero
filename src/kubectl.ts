import debug from 'debug';
debug('app:kubectl')

import {KubeConfig, VersionApi, CoreV1Api, AppsV1Api, CustomObjectsApi} from '@kubernetes/client-node'
import { namespace as namespace_chart} from './charts/namespace';
import { pipeline as pipeline_chart} from './charts/pipeline';


export class Kubectl {
    kc: KubeConfig;
    versionApi: VersionApi;
    coreV1Api: CoreV1Api;
    appsV1Api: AppsV1Api;
    customObjectsApi: CustomObjectsApi;

    constructor() {
        this.kc = new KubeConfig();
        //this.kc.loadFromDefault();

        if (process.env.KUBECONFIG_BASE64) {
            debug.log("load kubectl config from base64");
            let buff = Buffer.from(process.env.KUBECONFIG_BASE64, 'base64');
            const kubeconfig = buff.toString('ascii');
            this.kc.loadFromString(kubeconfig);
        } else if(process.env.KUBECONFIG_PATH) { 
            debug.log("load kubectl config from file");
            this.kc.loadFromFile(process.env.KUBECONFIG_PATH);
        } else{
            debug.log("load from cluster");
            try {
                this.kc.loadFromCluster();
            } catch (error) {
                console.log("error loading from cluster");
                console.log(error);
            }
        }

        this.versionApi = this.kc.makeApiClient(VersionApi);
        this.coreV1Api = this.kc.makeApiClient(CoreV1Api);
        this.appsV1Api = this.kc.makeApiClient(AppsV1Api);
        this.customObjectsApi = this.kc.makeApiClient(CustomObjectsApi);
        
    }

    async createPipeline(pipeline_name: string) {
        pipeline_chart.metadata.name = pipeline_name;
        
        this.customObjectsApi.createNamespacedCustomObject(
            "keroku.dev",
            "v1alpha1",
            "keroku",
            "pipelines",
            pipeline_chart
        ).catch(error => {
            console.log(error);
        });
    }

    async createNamespace(ns_name: string) {

        console.log("create namespace ");

        try {
            namespace_chart.metadata.name = ns_name;
            console.log(namespace_chart);
            const ret = await this.coreV1Api.createNamespace(namespace_chart);
            //debug.debug(ret);
        } catch (error) {
            debug.log(error);
        }
    }

    async getKubeVersion() {
        let versionInfo = await this.versionApi.getCode()
        let kubeVersion = versionInfo.body;
        console.log(kubeVersion);
        return kubeVersion;
    }
}