import debug from 'debug';
debug('app:kubectl')

import {
    KubeConfig, 
    VersionApi, 
    CoreV1Api, 
    AppsV1Api, 
    CustomObjectsApi, 
    KubernetesListObject, 
    KubernetesObject,
    VersionInfo, 
    PatchUtils,
    Log as KubeLog,
    V1Pod,
} from '@kubernetes/client-node'
import { namespace as namespace_chart} from './charts/namespace';
import { IPipeline, IKubectlPipeline, IKubectlPipelineList, IKubectlAppList} from './types';
import { App, KubectlApp } from './types/application';
import { KubectlPipeline } from './types/pipeline';
import { IAddon, IAddonMinimal } from './addons';


export class Kubectl {
    private kc: KubeConfig;
    private versionApi: VersionApi;
    private coreV1Api: CoreV1Api;
    private appsV1Api: AppsV1Api;
    private customObjectsApi: CustomObjectsApi;
    private kubeVersion: VersionInfo;
    private patchUtils: PatchUtils;
    public log: KubeLog;

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
        
        this.log = new KubeLog(this.kc);
    }

    public getContexts() {
        return this.kc.getContexts()
        //return this.kc.getCurrentContext();
    }

    public async setCurrentContext(context: string) {
        this.kc.setCurrentContext(context)
    }

    public async getPipelinesList() {
        this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
        let pipelines = await this.customObjectsApi.listNamespacedCustomObject(
            'application.kubero.dev', 
            'v1alpha1', 
            'keroku', 
            'kuberopipelines', 
            'default'
        );
        //console.log(pipelines.body);
        return pipelines.body as IKubectlPipelineList;
    }


    public async createPipeline(pl: IPipeline) {
        console.log(pl)
        let pipeline = new KubectlPipeline(pl);

        this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
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

    public async deletePipeline(pipelineName: string) {
        this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
        await this.customObjectsApi.deleteNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            "keroku",
            "kuberopipelines",
            pipelineName
        ).catch(error => {
            console.log(error);
        });
    }

    public async getPipeline(pipelineName: string): Promise<IKubectlPipeline> {

        this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
        let pipeline = await this.customObjectsApi.getNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            "keroku",
            "kuberopipelines",
            pipelineName
        ).catch(error => {
            console.log(error);
        });
        if (pipeline) {
            return pipeline.body as IKubectlPipeline;
        } else {
            return {} as IKubectlPipeline;
        }
    }

    public async createSecret(namespace: string, secretName: string, secretData: any, context: string) {
        let secret = {
            apiVersion: "v1",
            kind: "Secret",
            metadata: {
                name: secretName,
                namespace: namespace
            },
            type: "Opaque",
            data: secretData
        }
        this.kc.setCurrentContext(context);
        await this.coreV1Api.createNamespacedSecret(namespace, secret).catch(error => {
            console.log(error);
        }
        );
    }

    public async createNamespace(ns_name: string, context: string) {

        console.log("create namespace ");

        try {
            namespace_chart.metadata.name = ns_name;
            console.log(namespace_chart);
            this.kc.setCurrentContext(context);
            const ret = await this.coreV1Api.createNamespace(namespace_chart);
            //debug.debug(ret);
        } catch (error) {
            debug.log(error);
        }
    }

    public async deleteNamespace(ns_name: string, context: string) {
        console.log("delete namespace ");

        try {
            this.kc.setCurrentContext(context);
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

    public async createApp(app: App, context: string) {
        console.log(app)
        this.kc.setCurrentContext(context);

        let appl = new KubectlApp(app.name);
        appl.spec = app

        let namespace = app.pipeline+'-'+app.phase;

        let pipeline = await this.getPipeline(app.pipeline)
        appl.spec.gitrepo = pipeline.spec.github.repository
        
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

    public async updateApp(app: App, resourceVersion: string, context: string) {
        console.log(app)
        this.kc.setCurrentContext(context);

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

    public async deleteApp(pipelineName: string, phaseName: string, appName: string, context: string) {

        let namespace = pipelineName+'-'+phaseName;
        this.kc.setCurrentContext(context);
        
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

    public async getApp(pipelineName: string, phaseName: string, appName: string, context: string) {

        let namespace = pipelineName+'-'+phaseName;
        this.kc.setCurrentContext(context);
        
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

    public async getAppsList(namespace: string, context: string) {
        this.kc.setCurrentContext(context);
        let appslist = await this.customObjectsApi.listNamespacedCustomObject(
            'application.kubero.dev', 
            'v1alpha1', 
            namespace, 
            'kuberoapps'
        )
        //console.log(apps.body);
        return appslist.body as IKubectlAppList;
    }

    public async restartApp(pipelineName: string, phaseName: string, appName: string, context: string) {
        this.kc.setCurrentContext(context);
            
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
            debug.log('ERROR: '+error.body.message);
        });
    };

    public async getOperators() {
        // TODO list operators from all clusters

        /*
        apiVersion: operators.coreos.com/v1alpha1
        kind: ClusterServiceVersion*/
        let response = await this.customObjectsApi.listClusterCustomObject(
            'operators.coreos.com', 
            'v1alpha1', 
            'clusterserviceversions', 
            'default'
        );

        //let operators = response.body as KubernetesListObject<KubernetesObject>;
        let operators = response.body as any // TODO : fix type. This is a hacky way to get the type to work
        return operators.items;
    }

    public async createAddon(addon: IAddon, namespace: string, context: string) {
        let apiVersion = addon.crd.apiVersion as string;
        this.kc.setCurrentContext(context);

        await this.customObjectsApi.createNamespacedCustomObject(
            apiVersion.split('/')[0],
            apiVersion.split('/')[1],
            namespace,
            addon.plural,
            addon.crd
        ).catch(error => {
            debug.log(addon.crd);
            debug.log('ERROR: '+error.body.message);
        })
    }

    public async deleteAddon(addon: IAddonMinimal, context: string) {
        this.kc.setCurrentContext(context);
        await this.customObjectsApi.deleteNamespacedCustomObject(
            addon.group,
            addon.version,
            addon.namespace,
            addon.plural,
            addon.id
        ).catch(error => {
            console.log(addon)
            debug.log('ERROR: '+error);
        })
    }

    public async getPods(namespace: string, context: string): Promise<V1Pod[]>{
        const pods = await this.coreV1Api.listNamespacedPod(namespace);
        return pods.body.items;
    }
}