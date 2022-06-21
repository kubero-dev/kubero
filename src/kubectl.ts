import debug from 'debug';
debug('app:kubectl')

import {KubeConfig, VersionApi, CoreV1Api, AppsV1Api, CustomObjectsApi, VersionInfo, PatchUtils} from '@kubernetes/client-node'
import { namespace as namespace_chart} from './charts/namespace';
import { IPipeline, IKubectlPipeline, IKubectlAppList} from './types';
import { App, KubectlApp } from './types/application';
import { KubectlPipeline } from './types/pipeline';


export class Kubectl {
    private kc: KubeConfig;
    private versionApi: VersionApi;
    private coreV1Api: CoreV1Api;
    private appsV1Api: AppsV1Api;
    private customObjectsApi: CustomObjectsApi;
    private kubeVersion: VersionInfo;
    private patchUtils: PatchUtils;

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
        this.patchUtils = new PatchUtils();
        this.customObjectsApi = this.kc.makeApiClient(CustomObjectsApi);

        this.kubeVersion = new VersionInfo();
        this.getKubeVersion().then(v => {
            this.kubeVersion = v;
        })
        
    }

    public async getPipelinesList() {
        let pipelines = await this.customObjectsApi.listNamespacedCustomObject(
            'application.kubero.dev', 
            'v1alpha1', 
            'keroku', 
            'kuberopipelines', 
            'default'
        );
        //console.log(pipelines.body);
        return pipelines.body;
    }


    public async createPipeline(pl: IPipeline) {
        console.log(pl)
        let pipeline = new KubectlPipeline(pl);

        await this.customObjectsApi.createNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            "keroku",
            "kuberopipelines",
            pipeline
        ).catch(error => {
            console.log(error);
        });
    }

    public async deletePipeline(appname: string) {
        await this.customObjectsApi.deleteNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            "keroku",
            "kuberopipelines",
            appname
        ).catch(error => {
            console.log(error);
        });
    }

    public async getPipeline(appname: string): Promise<IKubectlPipeline> {
        let pipeline = await this.customObjectsApi.getNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            "keroku",
            "kuberopipelines",
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
        this.kubeVersion= versionInfo.body;
        console.log(this.kubeVersion);
        return this.kubeVersion;
    }

    public async createApp(app: App, envvars: { name: string; value: string; }[]) {
        console.log(app)

        let appl = new KubectlApp(app.name);
        appl.spec = app

        let namespace = app.pipeline+'-'+app.phase;
        
        await this.customObjectsApi.createNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            namespace,
            "kuberoapps",
            appl
        ).catch(error => {
            console.log(error);
        })
    }

    public async updateApp(app: App, envvars: { name: string; value: string; }[], resourceVersion: string) {
        console.log(app)

        let appl = new KubectlApp(app.name);
        appl.metadata.resourceVersion = resourceVersion;
        appl.spec = app

        let namespace = app.pipeline+'-'+app.phase;
        
        await this.customObjectsApi.replaceNamespacedCustomObject(
        //await this.customObjectsApi.patchNamespacedCustomObject( 
        // patch : https://stackoverflow.com/questions/67520468/patch-k8s-custom-resource-with-kubernetes-client-node
        // https://github.com/kubernetes-client/javascript/blob/master/examples/patch-example.js
            "application.kubero.dev",
            "v1alpha1",
            namespace,
            "kuberoapps",
            app.name,
            appl
        ).catch(error => {
            console.log(error);
        })
    }

    public async deleteApp(pipelineName: string, phaseName: string, appName: string) {

        let namespace = pipelineName+'-'+phaseName;
        
        await this.customObjectsApi.deleteNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            namespace,
            "kuberoapps",
            appName
        ).catch(error => {
            console.log(error);
        })
    }

    public async getApp(pipelineName: string, phaseName: string, appName: string) {

        let namespace = pipelineName+'-'+phaseName;
        
        let app = await this.customObjectsApi.getNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            namespace,
            "kuberoapps",
            appName
        ).catch(error => {
            console.log(error);
        })

        return app;
    }

    public async getAppsList(namespace: string) {
        let appslist = await this.customObjectsApi.listNamespacedCustomObject(
            'application.kubero.dev', 
            'v1alpha1', 
            namespace, 
            'kuberoapps'
        );
        //console.log(apps.body);
        return appslist.body as IKubectlAppList;
    }

    public async restartApp(pipelineName: string, phaseName: string, appName: string) {
            
        let namespace = pipelineName+'-'+phaseName;
        let deploymentName = appName+'-kuberoapp';
        const date = new Date();

        // format : https://jsonpatch.com/
        const patch = [
            {
              op: 'add',
              path: '/spec/template/metadata/annotations',
              value: {
                  'kubectl.kubero.dev/restartedAt': date.toISOString()
              }
            },
          ];
        
        const options = { "headers": { "Content-type": 'application/json-patch+json' } };
        this.appsV1Api.patchNamespacedDeployment(
            deploymentName,
            namespace,
            patch, 
            undefined, 
            undefined, 
            undefined, 
            undefined, 
            options 
        ).then(() => {
            console.log(`Deployment ${deploymentName} in Pipeline ${namespace} updated`);
        }).catch(error => {
            console.log(error);
        });
    };
}