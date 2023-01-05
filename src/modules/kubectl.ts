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
    CoreV1Event,
    CoreV1EventList,
    V1ConfigMap,
    V1Namespace,
    Metrics,
    PodMetric,
    PodMetricsList,
    NodeMetric,
} from '@kubernetes/client-node'
import { IPipeline, IKubectlPipeline, IKubectlPipelineList, IKubectlAppList, IKuberoConfig} from '../types';
import { App, KubectlApp } from './application';
import { KubectlPipeline } from './pipeline';
import { IAddon, IAddonMinimal } from './addons';


export class Kubectl {
    private kc: KubeConfig;
    private versionApi: VersionApi;
    private coreV1Api: CoreV1Api;
    private appsV1Api: AppsV1Api;
    private metricsApi: Metrics;
    private customObjectsApi: CustomObjectsApi;
    private kubeVersion: VersionInfo | void;
    private patchUtils: PatchUtils;
    public log: KubeLog;
    public config: IKuberoConfig;

    constructor(config: IKuberoConfig) {
        this.config = config;
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
            try {
                this.kc.loadFromCluster();
                debug.log("kubeconfig loaded from cluster");
            } catch (error) {
                debug.log("error loading from cluster");
                debug.log(error);
            }
        }

        this.versionApi = this.kc.makeApiClient(VersionApi);
        this.coreV1Api = this.kc.makeApiClient(CoreV1Api);
        this.appsV1Api = this.kc.makeApiClient(AppsV1Api);
        this.metricsApi = new Metrics(this.kc);
        this.patchUtils = new PatchUtils();
        this.customObjectsApi = this.kc.makeApiClient(CustomObjectsApi);

        this.kubeVersion = new VersionInfo();
        this.getKubeVersion()
        .catch(error => {
            debug.log("error getting kube version");
            debug.log(error);
        })
        .then(v => {
            this.kubeVersion = v;
        })

        this.log = new KubeLog(this.kc);
    }

    public getContexts() {
        return this.kc.getContexts()
    }

    public async setCurrentContext(context: string) {
        this.kc.setCurrentContext(context)
    }

    public async getPipelinesList() {
        this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
        let pipelines = await this.customObjectsApi.listNamespacedCustomObject(
            'application.kubero.dev',
            'v1alpha1',
            process.env.KUBERO_NAMESPACE || 'kubero',
            'kuberopipelines',
            'default'
        );
        return pipelines.body as IKubectlPipelineList;
    }

    public async createPipeline(pl: IPipeline) {
        debug.log("create pipeline: " + pl.name);
        let pipeline = new KubectlPipeline(pl);

        this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
        await this.customObjectsApi.createNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            process.env.KUBERO_NAMESPACE || 'kubero',
            "kuberopipelines",
            pipeline
        ).catch(error => {
            debug.log(error);
        });
    }

    public async updatePipeline(pl: IPipeline, resourceVersion: string ) {
        debug.log("update pipeline: " + pl.name);
        let pipeline = new KubectlPipeline(pl);
        pipeline.metadata.resourceVersion = resourceVersion;

        this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
        await this.customObjectsApi.replaceNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            process.env.KUBERO_NAMESPACE || 'kubero',
            "kuberopipelines",
            pl.name,
            pipeline
        ).catch(error => {
            debug.log(error);
        });
    }

    public async deletePipeline(pipelineName: string) {
        debug.log("delete pipeline: " + pipelineName);
        this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
        await this.customObjectsApi.deleteNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            process.env.KUBERO_NAMESPACE || 'kubero',
            "kuberopipelines",
            pipelineName
        ).catch(error => {
            debug.log(error);
        });
    }

    public async getPipeline(pipelineName: string): Promise<IKubectlPipeline> {

        this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
        let pipeline = await this.customObjectsApi.getNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            process.env.KUBERO_NAMESPACE || 'kubero',
            "kuberopipelines",
            pipelineName
        ).catch(error => {
            debug.log(error);
        });
        if (pipeline) {
            return pipeline.body as IKubectlPipeline;
        } else {
            return {} as IKubectlPipeline;
        }
    }

    public async getKubeVersion() {
        let versionInfo = await this.versionApi.getCode()
        this.kubeVersion= versionInfo.body;
        debug.debug(JSON.stringify(this.kubeVersion));
        return this.kubeVersion;
    }

    public async createApp(app: App, context: string) {
        debug.log("create app: " + app.name);
        this.kc.setCurrentContext(context);

        let appl = new KubectlApp(app);

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

    public async updateApp(app: App, resourceVersion: string, context: string) {
        debug.log("update app: " + app.name);
        this.kc.setCurrentContext(context);

        let appl = new KubectlApp(app);
        appl.metadata.resourceVersion = resourceVersion;

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
            debug.log(error);
        })
    }

    public async deleteApp(pipelineName: string, phaseName: string, appName: string, context: string) {
        debug.log("delete app: " + appName);

        let namespace = pipelineName+'-'+phaseName;
        this.kc.setCurrentContext(context);

        await this.customObjectsApi.deleteNamespacedCustomObject(
            "application.kubero.dev",
            "v1alpha1",
            namespace,
            "kuberoapps",
            appName
        ).catch(error => {
            debug.log(error);
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
            debug.log(error);
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
        return appslist.body as IKubectlAppList;
    }

    public async restartApp(pipelineName: string, phaseName: string, appName: string, workloadType: string, context: string) {
        debug.log("restart app: " + appName);
        this.kc.setCurrentContext(context);

        let namespace = pipelineName+'-'+phaseName;
        let deploymentName = appName+'-kuberoapp-'+workloadType;
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
            debug.log(`Deployment ${deploymentName} in Pipeline ${namespace} updated`);
        }).catch(error => {
            if (error.body.message) {
                debug.log('ERROR: '+error.body.message);
            }
            debug.log('ERROR: '+error);
        });
    };

    public async getOperators() {
        // TODO list operators from all clusters
        let operators = { items: [] };
        try {
            let response = await this.customObjectsApi.listNamespacedCustomObject(
                'operators.coreos.com',
                'v1alpha1',
                'operators',
                'clusterserviceversions'
            )
            //let operators = response.body as KubernetesListObject<KubernetesObject>;
            operators = response.body as any // TODO : fix type. This is a hacky way to get the type to work
        } catch (error) {
            debug.log(error);
            debug.log("error getting operators");
        }

        return operators.items;
    }

    public async getPods(namespace: string, context: string): Promise<V1Pod[]>{
        const pods = await this.coreV1Api.listNamespacedPod(namespace);
        return pods.body.items;
    }

    public async getKuberoconfig(): Promise<V1ConfigMap | void> {
        let config = await this.coreV1Api.readNamespacedConfigMap(
            'kubero-config',
            'kubero'
        ).catch((error: any) => {
            debug.log(error);
        })

        if (config) {
            return config.body;
        }
    }

    public async createEvent(type: "Normal" | "Warning",reason: string, eventName: string, message: string) {
        debug.log("create event: " + eventName);

        const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days in the future //TODO make this configurable
        const event = new CoreV1Event();
        event.apiVersion = "v1";
        event.kind = "Event";
        event.type = type;
        event.message = message;
        event.reason = reason;
        event.metadata = {
            name: eventName+'.'+Date.now().toString(),
            namespace: process.env.KUBERO_NAMESPACE || 'kubero',
        };
        event.involvedObject = {
            kind: "Kubero",
            namespace: process.env.KUBERO_NAMESPACE || 'kubero',
        };

        await this.coreV1Api.createNamespacedEvent(
            process.env.KUBERO_NAMESPACE || 'kubero',
            event
        ).catch(error => {
            debug.log(error);
        }
    )};

    public async getEvents(namespace: string): Promise<CoreV1Event[]> {
        let events = await this.coreV1Api.listNamespacedEvent(namespace);
        return events.body.items;
    }

    public async getPodMetrics(namespace: string): Promise<any> { //TODO make this a real type
        const ret = [];

        try {
            const metrics = await this.metricsApi.getPodMetrics(namespace);

            for (let i = 0; i < metrics.items.length; i++) {
                const metric = metrics.items[i];
                const pod = await this.coreV1Api.readNamespacedPod(metric.metadata.name, namespace);
                const requestCPU = this.normalizeCPU(pod.body.spec?.containers[0].resources?.requests?.cpu || '0');
                const requestMemory = this.normalizeMemory(pod.body.spec?.containers[0].resources?.requests?.memory || '0');
                const limitsCPU = this.normalizeCPU(pod.body.spec?.containers[0].resources?.limits?.cpu || '0');
                const limitsMemory = this.normalizeMemory(pod.body.spec?.containers[0].resources?.limits?.memory || '0');
                const usageCPU = this.normalizeCPU(metric.containers[0].usage.cpu);
                const usageMemory = this.normalizeMemory(metric.containers[0].usage.memory);
                const percentageCPU = Math.round(usageCPU / limitsCPU * 100);
                const percentageMemory = Math.round(usageMemory / limitsMemory * 100);

                /* debug caclulation *//*
                console.log("resource CPU    : " + requestCPU, pod.body.spec?.containers[0].resources?.requests?.cpu)
                console.log("limits CPU      : " + limitsCPU, pod.body.spec?.containers[0].resources?.limits?.cpu)
                console.log("usage CPU       : " + usageCPU, metric.containers[0].usage.cpu)
                console.log("percent CPU     : " + percentageCPU + "%")
                console.log("resource Memory : " + requestMemory, pod.body.spec?.containers[0].resources?.limits?.cpu)
                console.log("limits Memory   : " + limitsMemory, pod.body.spec?.containers[0].resources?.limits?.memory)
                console.log("usage Memory    : " + usageMemory, metric.containers[0].usage.memory)
                console.log("percent Memory  : " + percentageMemory + "%")
                console.log("------------------------------------")
                /* end debug calculations*/

                const m = {
                    name: metric.metadata.name,
                    namespace: metric.metadata.namespace,
                    memory : {
                        unit: 'Mi',
                        request: requestMemory,
                        limit: limitsMemory,
                        usage: usageMemory,
                        percentage: percentageMemory
                    },
                    cpu : {
                        unit: 'm',
                        request: requestCPU,
                        limit: limitsCPU,
                        usage: usageCPU,
                        percentage: percentageCPU
                    }
                }
                ret.push(m);
            }
        } catch (error: any) {
            debug.log('ERROR fetching metrics: '+ error);
        }

        return ret;
    }

    private normalizeCPU(resource: string): number {

        const regex = /([0-9]+)([a-zA-Z]*)/;
        const matches = resource.match(regex);

        let value = 0;
        let unit = '';
        if (matches !== null && matches[1]) {
            value = parseInt(matches[1])
        }
        if (matches !== null && matches[2]) {
            unit = matches[2]
        }

        //console.log("CPU unit: " + unit + " value: " + value + " :: " +resource);
        switch (unit) {
            case 'm':
                return value / 1;
            case 'n':
                return Math.round(value / 1000000);
            default:
                return value * 1000;
        }
        return 0;
    }


    private normalizeMemory(resource: string): number {

        const regex = /([0-9]+)([a-zA-Z]*)/;
        const matches = resource.match(regex);

        let value = 0;
        let unit = '';
        if (matches !== null && matches[1]) {
            value = parseInt(matches[1])
        }
        if (matches !== null && matches[2]) {
            unit = matches[2]
        }
        //console.log("CPU unit: " + unit + " value: " + value + " :: " +resource);

        switch (unit) {
            case 'Gi':
                return value * 1000;
            case 'Mi':
                return value / 1;
            case 'Ki':
                return Math.round(value / 1000);
            default:
                return value;
        }
        return 0;
    }

    public async getNodeMetrics(): Promise<NodeMetric[]> {
        const metrics = await this.metricsApi.getNodeMetrics();
        return metrics.items;
    }
}