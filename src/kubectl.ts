import debug from 'debug';
debug('app:kubectl')

import {KubeConfig, VersionApi, CoreV1Api, AppsV1Api, CustomObjectsApi} from '@kubernetes/client-node'
import { namespace as namespace_chart} from './charts/namespace';
import { pipeline as pipeline_chart} from './charts/pipeline';
import { application as application_chart} from './charts/app';
import { IApp, IPipeline, IKubectlPipeline, IKubectlApp, IKubectlAppList} from './types';


export class Kubectl {
    private kc: KubeConfig;
    private versionApi: VersionApi;
    private coreV1Api: CoreV1Api;
    private appsV1Api: AppsV1Api;
    private customObjectsApi: CustomObjectsApi;

    constructor() {
        this.kc = new KubeConfig();
        //this.kc.loadFromDefault(); // should not be used since we want also load from base64 ENV var

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
        let pipelines = await this.customObjectsApi.listNamespacedCustomObject('kubero.dev', 'v1alpha1', 'keroku', 'pipelines', 'default');
        //console.log(pipelines.body);
        return pipelines.body;
    }

    public async createPipeline(pipeline: IPipeline) {
        pipeline_chart.metadata.name = pipeline.name;
        pipeline_chart.spec.name = pipeline.name;

        // create a entrie for each phase
        pipeline_chart.spec.phases.length = 0; // clear phases
        for (const phase of pipeline.phases) {
            pipeline_chart.spec.phases.push({
                name: phase.name,
                enabled: !!phase.enabled
            });
        }

        await this.customObjectsApi.createNamespacedCustomObject(
            "kubero.dev",
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
            "kubero.dev",
            "v1alpha1",
            "keroku",
            "pipelines",
            appname
        ).catch(error => {
            console.log(error);
        });
    }

    public async getPipeline(appname: string): Promise<IKubectlPipeline> {
        let pipeline = await this.customObjectsApi.getNamespacedCustomObject(
            "kubero.dev",
            "v1alpha1",
            "keroku",
            "pipelines",
            appname
        ).catch(error => {
            console.log(error);
        });
        if (pipeline) {
            return pipeline.body as IKubectlPipeline;
        } else {
            return {} as IKubectlPipeline;
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

    public async createApp(app: IApp){
        console.log(app)

        let appl:IKubectlApp = application_chart;
        appl.metadata.name = app.name;
        appl.spec = app
        
        await this.customObjectsApi.createNamespacedCustomObject(
            "kubero.dev",
            "v1alpha1",
            app.pipeline+'-'+app.phase,
            "applications",
            application_chart
        ).catch(error => {
            console.log(error);
        })
    }

    public async getAppsList(namespace: string) {
        let appslist = await this.customObjectsApi.listNamespacedCustomObject('kubero.dev', 'v1alpha1', namespace, 'applications');
        //console.log(apps.body);
        return appslist.body as IKubectlAppList;
    }
}