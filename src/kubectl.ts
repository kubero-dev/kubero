import debug from 'debug';
debug('app:kubectl')

import {KubeConfig, VersionApi, CoreV1Api, AppsV1Api, CustomObjectsApi} from '@kubernetes/client-node'
import { namespace as namespace_chart} from './charts/namespace';
import { pipeline as pipeline_chart} from './charts/pipeline';


export class Kubectl {
    private kc: KubeConfig;
    private versionApi: VersionApi;
    private coreV1Api: CoreV1Api;
    private appsV1Api: AppsV1Api;
    private customObjectsApi: CustomObjectsApi;

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

    public async getPipelinesList() {

        let pipelines = await this.customObjectsApi.listNamespacedCustomObject('keroku.dev', 'v1alpha1', 'keroku', 'pipelines', 'default');
        //console.log(pipelines.body);
        return pipelines.body;
    }

    public async createPipeline(appname: string, gitrepo: string, reviewapps: boolean) {
        pipeline_chart.metadata.name = appname;
        pipeline_chart.spec.appName = appname;
        pipeline_chart.spec.gitrepo = gitrepo;
        
        await this.customObjectsApi.createNamespacedCustomObject(
            "keroku.dev",
            "v1alpha1",
            "keroku",
            "pipelines",
            pipeline_chart
        ).catch(error => {
            console.log(error);
        });
    }

    public async deletePipeline(appname: string) {
        await this.customObjectsApi.deleteNamespacedCustomObject(
            "keroku.dev",
            "v1alpha1",
            "keroku",
            "pipelines",
            appname
        ).catch(error => {
            console.log(error);
        });
    }

    public async getPipeline(appname: string) {
        let pipeline = await this.customObjectsApi.getNamespacedCustomObject(
            "keroku.dev",
            "v1alpha1",
            "keroku",
            "pipelines",
            appname
        ).catch(error => {
            console.log(error);
        });
        if (pipeline) {
            return pipeline.body;
        } else {
            return null;
        }
    }

    public async createNamespace(ns_name: string) {

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

    public async deleteNamespace(ns_name: string) {

        console.log("delete namespace ");

        try {
            const ret = await this.coreV1Api.deleteNamespace(ns_name);
            //debug.debug(ret);
        } catch (error) {
            debug.log(error);
        }
    }

    public async getKubeVersion() {
        let versionInfo = await this.versionApi.getCode()
        let kubeVersion = versionInfo.body;
        console.log(kubeVersion);
        return kubeVersion;
    }
}