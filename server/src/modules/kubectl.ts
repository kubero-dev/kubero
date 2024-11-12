import debug from 'debug';
debug('app:kubectl')

import {
    KubeConfig,
    Exec,
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
    StorageV1Api,
    BatchV1Api,
    NetworkingV1Api,
    V1ServiceAccount,
    V1Job
} from '@kubernetes/client-node'
import { IPipeline, IKubectlPipeline, IKubectlPipelineList, IKubectlAppList, IKuberoConfig, Uptime} from '../types';
import { App, KubectlApp } from './application';
import { KubectlPipeline } from './pipeline';
import { WebSocket } from 'ws';
import stream from 'stream';
import internal from 'stream';
import { loadJob } from './deployments';

export class Kubectl {
    private kc: KubeConfig;
    private versionApi: VersionApi = {} as VersionApi;
    private coreV1Api: CoreV1Api = {} as CoreV1Api;
    private appsV1Api: AppsV1Api = {} as AppsV1Api;
    private metricsApi: Metrics = {} as Metrics;
    private storageV1Api: StorageV1Api = {} as StorageV1Api;
    private batchV1Api: BatchV1Api = {} as BatchV1Api;
    private customObjectsApi: CustomObjectsApi = {} as CustomObjectsApi;
    private networkingV1Api: NetworkingV1Api = {} as NetworkingV1Api;
    public kubeVersion: VersionInfo | void;
    public kuberoOperatorVersion: string | undefined;
    private patchUtils: PatchUtils = {} as PatchUtils;
    public log: KubeLog;
    //public config: IKuberoConfig;
    private exec: Exec = {} as Exec;

    constructor() {
        //this.config = config;
        this.kc = new KubeConfig();
        //this.kc.loadFromDefault(); // should not be used since we want also load from base64 ENV var

        if (process.env.KUBECONFIG_BASE64) {
            debug.log("Use kubectl config from base64");
            let buff = Buffer.from(process.env.KUBECONFIG_BASE64, 'base64');
            const kubeconfig = buff.toString('ascii');
            this.kc.loadFromString(kubeconfig);
        } else if(process.env.KUBECONFIG_PATH) {
            debug.log("Use kubectl config from file " + process.env.KUBECONFIG_PATH);
            this.kc.loadFromFile(process.env.KUBECONFIG_PATH);
        } else{
            try {
                this.kc.loadFromCluster();
                debug.log("Kubeconfig loaded from cluster");
            } catch (error) {
                debug.log("❌ Error loading from cluster");
                debug.log(error);
            }
        }

        this.log = new KubeLog(this.kc);

        try {
            this.versionApi = this.kc.makeApiClient(VersionApi);
            this.coreV1Api = this.kc.makeApiClient(CoreV1Api);
            this.appsV1Api = this.kc.makeApiClient(AppsV1Api);
            this.storageV1Api = this.kc.makeApiClient(StorageV1Api);
            this.batchV1Api = this.kc.makeApiClient(BatchV1Api);
            this.networkingV1Api = this.kc.makeApiClient(NetworkingV1Api);
            this.metricsApi = new Metrics(this.kc);
            this.patchUtils = new PatchUtils();
            this.exec = new Exec(this.kc)
            this.customObjectsApi = this.kc.makeApiClient(CustomObjectsApi);
        } catch (error) {
            debug.log("❌ Error creating api clients. Check kubeconfig, cluster connectivity and context");
            debug.log(error);
            this.kubeVersion = void 0;
            return;
        }

        this.kubeVersion = new VersionInfo();
        this.getKubeVersion()
        .then(v => {
            this.kubeVersion = v;
        })
        .catch(error => {
            debug.log("❌ Error getting kube version");
            debug.log(error);
        });

        this.getOperatorVersion()
        .then(v => {
            debug.log("ℹ️  Operator version: " + v);
            this.kuberoOperatorVersion = v || 'unknown';
        })

    }

    public async getKubeVersion(): Promise<VersionInfo | void>{
        // TODO and WARNING: This does not respect the context set by the user!
        try {
            let versionInfo = await this.versionApi.getCode()
            debug.debug(JSON.stringify(versionInfo.body));
            return versionInfo.body;
        } catch (error) {
            debug.log("getKubeVersion: error getting kube version");
            //debug.log(error);
        }
    }

    private async getOperatorVersion(): Promise<string | void> {
        const contextName = this.getCurrentContext();
        const namespace = "kubero-operator-system";

        if (contextName) {
            const pods = await this.getPods(namespace, contextName) 
            .catch(error => {
                debug.log("Failed to get Operator Version", error);
                //return 'error';
            });
            if (pods) {
                for (const pod of pods) {
                    if (pod?.metadata?.name?.startsWith('kubero-operator-controller-manager')) {
                        const container = pod?.spec?.containers.filter((c: any) => c.name == 'manager')[0];
                        return container?.image?.split(':')[1] || 'unknown';
                    }
                }
            }else{
                return 'error getting operator version';
            }
        }
    }

    public getContexts() {
        return this.kc.getContexts()
    }

    public async setCurrentContext(context: string) {
        this.kc.setCurrentContext(context)
    }

    public getCurrentContext() {
        return this.kc.getCurrentContext()
    }

    public async getNamespaces(): Promise<V1Namespace[]> {
        const namespaces = await this.coreV1Api.listNamespace();
        return namespaces.body.items;
    }

    public async getPipelinesList() {
        this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
        try {
            let pipelines = await this.customObjectsApi.listNamespacedCustomObject(
                'application.kubero.dev',
                'v1alpha1',
                process.env.KUBERO_NAMESPACE || 'kubero',
                'kuberopipelines'
            )
            return pipelines.body as IKubectlPipelineList;
        } catch (error) {
            //debug.log(error);
            debug.log("getPipelinesList: error getting pipelines");
        }
        const pipelines = {} as IKubectlPipelineList;
        pipelines.items = [];
        return pipelines;
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
            throw error;
        });
        if (pipeline) {
            return pipeline.body as IKubectlPipeline;
        } else {
            throw new Error("Pipeline not found");
            //return {} as IKubectlPipeline;
        }
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

    public async getAppsList(namespace: string, context: string): Promise<IKubectlAppList> {
        this.kc.setCurrentContext(context);
        try {
            let appslist = await this.customObjectsApi.listNamespacedCustomObject(
                'application.kubero.dev',
                'v1alpha1',
                namespace,
                'kuberoapps'
            )
            return appslist.body as IKubectlAppList;
        } catch (error) {
            debug.log(error);
            debug.log("getAppsList: error getting apps");
        }
        const appslist = {} as IKubectlAppList;
        appslist.items = [];
        return appslist as IKubectlAppList;
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
              path: '/spec/restartedAt',
              value: {
                  'restartedAt': date.toISOString()
              }
            },
          ];

        const apiVersion = "v1alpha1"
        const group = "application.kubero.dev"
        const plural = "kuberoapps"

        const options = { "headers": { "Content-type": 'application/json-patch+json' } };
        this.customObjectsApi.patchNamespacedCustomObject(
            group,
            apiVersion,
            namespace,
            plural,
            appName,
            patch,
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

    public async getCustomresources() {
        // TODO list operators from all clusters
        let operators = { items: [] };
        try {
            let response = await this.customObjectsApi.listClusterCustomObject(
                'apiextensions.k8s.io',
                'v1',
                'customresourcedefinitions'
            )
            operators = response.body as any // TODO : fix type. This is a hacky way to get the type to work
        } catch (error: any) {
            //debug.log(error);
            debug.log("error getting customresources");
        }

        return operators.items;
    }

    public async getPods(namespace: string, context: string): Promise<V1Pod[]>{
        const pods = await this.coreV1Api.listNamespacedPod(namespace);
        return pods.body.items;
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
        try {
            const events = await this.coreV1Api.listNamespacedEvent(namespace);
            return events.body.items;
        } catch (error) {
            //debug.log(error);
            debug.log("getEvents: error getting events");
        }
        const events = {} as CoreV1EventList;
        events.items = [];
        return events.items;
    }

    public async getPodMetrics(namespace: string, appName: string): Promise<any> { //TODO make this a real type
        const ret = [];

        try {
            const metrics = await this.metricsApi.getPodMetrics(namespace);

            for (let i = 0; i < metrics.items.length; i++) {
                const metric = metrics.items[i];

                if ( !metric.metadata.name.startsWith(appName+"-") ) continue;

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

    private getPodUptimeMS(pod: V1Pod): number {
        const startTime = pod.status?.startTime;
        if (startTime) {
            const start = new Date(startTime);
            const now = new Date();
            const uptime = now.getTime() - start.getTime();
            return uptime;
        }
        return -1;
    }

    public async getPodUptimes(namespace: string): Promise<Object> {
        const pods = await this.coreV1Api.listNamespacedPod(namespace);
        const ret = Object();
        for (let i = 0; i < pods.body.items.length; i++) {
            const pod = pods.body.items[i];
            const uptime = this.getPodUptimeMS(pod);
            if (pod.metadata && pod.metadata.name) {
                ret[pod.metadata.name] = {
                    ms: uptime,
                    formatted: this.formatUptime(uptime)
                }
            }
        }
        return ret;
    }

    private formatUptime(uptime: number): string {
        // 0-120s show seconds
        // 2-10m show minutes and seconds
        // 10-120m show minutes
        // 2-48h show hours and minutes
        // 2-30d show days and hours
        // >30d show date

        if (uptime < 0) {
            return '';
        }
        if (uptime < 120000) {
            const seconds = Math.floor(uptime / 1000);
            return seconds + "s";
        }
        if (uptime < 600000) {
            const minutes = Math.floor(uptime / (1000 * 60));
            const seconds = Math.floor((uptime - (minutes * 1000 * 60)) / 1000);
            if (seconds > 0) {
                return minutes + "m" + seconds + "s";
            }
            return minutes + "m";
        }
        if (uptime < 7200000) {
            const minutes = Math.floor(uptime / (1000 * 60));
            return minutes + "m";
        }
        if (uptime < 172800000) {
            const hours = Math.floor(uptime / (1000 * 60 * 60));
            const minutes = Math.floor((uptime - (hours * 1000 * 60 * 60)) / (1000 * 60));
            if (minutes > 0) {
                return hours + "h" + minutes + "m";
            }
            return hours + "h";
        }
        //if (uptime < 2592000000) {
            const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((uptime - (days * 1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (hours > 0) {
                return days + "d" + hours + "h";
            }
            return days + "d";
        //}
        
    }
    
    public async getStorageglasses(): Promise<Object[]> {
        let ret = [];
        try {
            const storageClasses = await this.storageV1Api.listStorageClass();
            for (let i = 0; i < storageClasses.body.items.length; i++) {
                const sc = storageClasses.body.items[i];
                const storageClass = {
                    name: sc.metadata?.name,
                    provisioner: sc.provisioner,
                    reclaimPolicy: sc.reclaimPolicy,
                    volumeBindingMode: sc.volumeBindingMode,
                    //allowVolumeExpansion: sc.allowVolumeExpansion,
                    //parameters: sc.parameters
                }
                ret.push(storageClass);
            }
        } catch (error) {
            console.log(error);
            console.log('ERROR fetching storageclasses');
        }
        return ret;
    }

    public async  getIngressClasses(): Promise<Object[]> {
        // undefind = default
        let ret = [{
            name: undefined
        }] as Object[];
        try {
            const ingressClasses = await this.networkingV1Api.listIngressClass();
            for (let i = 0; i < ingressClasses.body.items.length; i++) {
                const ic = ingressClasses.body.items[i];
                const ingressClass = {
                    name: ic.metadata?.name,
                }
                ret.push(ingressClass);
            }
        } catch (error) {
            console.log(error);
            console.log('ERROR fetching ingressclasses');
        }
        return ret;
    }

    private async deleteScanJob(namespace: string, name: string): Promise<any> {
        try {
            await this.batchV1Api.deleteNamespacedJob(name, namespace);
            // wait for job to be deleted
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            //console.log(error);
            console.log('ERROR deleting job: '+name+' ' +namespace);
        }
    }

    public async createScanRepoJob(namespace: string, app: string, gitrepo: string, branch: string): Promise<any> {
        await this.deleteScanJob(namespace, app+'-kuberoapp-vuln');
        const job = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: {
                name: app+'-kuberoapp-vuln',
                namespace: namespace,
            },
            spec: {
                ttlSecondsAfterFinished: 86400,
                completions: 1,
                template: {
                    metadata: {
                        labels: {
                            vulnerabilityscan: app
                        }
                    },
                    spec: {
                        restartPolicy: 'Never',
                        securityContext: {
                            runAsUser: 1000
                        },
                        containers: [
                            {
                                name: 'trivy-repo-scan',
                                image: "aquasec/trivy:latest",
                                command: [
                                    "trivy",
                                    "repo",
                                    gitrepo,
                                    "--branch",
                                    branch,
                                    "-q",
                                    "-f",
                                    "json",
                                    "--scanners",
                                    "vuln,secret,config",
                                    "--cache-dir",
                                    "/tmp/trivy",
                                    "--exit-code",
                                    "0"
                                ],
                            }
                        ]
                    }
                }
            }
        };
        try {
            return await this.batchV1Api.createNamespacedJob(namespace, job);
        } catch (error) {
            console.log(error);
            console.log('ERROR creating Repo scan job: '+app+' ' +namespace);
        }
    }

    public async createScanImageJob(namespace: string, app: string, image: string, tag: string, withCredentials: boolean): Promise<any> {
        await this.deleteScanJob(namespace, app+'-kuberoapp-vuln');
        let job = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: {
                name: app+'-kuberoapp-vuln',
                namespace: namespace,
            },
            spec: {
                ttlSecondsAfterFinished: 86400,
                completions: 1,
                backoffLimit: 1,
                template: {
                    metadata: {
                        labels: {
                            vulnerabilityscan: app
                        }
                    },
                    spec: {
                        restartPolicy: 'Never',
                        securityContext: {
                            runAsUser: 1000
                        },
                        containers: [
                            {
                                name: 'trivy-repo-scan',
                                image: "aquasec/trivy:latest",
                                command: [
                                    "trivy",
                                    "image",
                                    image+":"+tag,
                                    "-q",
                                    "-f",
                                    "json",
                                    "--scanners",
                                    "vuln",
                                    "--cache-dir",
                                    "/tmp/trivy",
                                    "--exit-code",
                                    "0"
                                ],
                                env: [] as { name: string; valueFrom: { secretKeyRef: { name: string; key: string; optional: true; }; }; }[],
                            }
                        ]
                    }
                }
            }
        };

        if (withCredentials) {
            job.spec.template.spec.containers[0].env = [
                {
                    name: 'TRIVY_USERNAME',
                    valueFrom: {
                        secretKeyRef: {
                            name: 'registry-credentials',
                            key: 'username',
                            optional: true
                        }
                    }
                },
                {
                    name: 'TRIVY_PASSWORD',
                    valueFrom: {
                        secretKeyRef: {
                            name: 'registry-credentials',
                            key: 'password',
                            optional: true
                        }
                    }
                }
            ]
        }
        
        try {
            return await this.batchV1Api.createNamespacedJob(namespace, job);
        } catch (error) {
            console.log(error);
            console.log('ERROR creating Image scan job');
        }
    }

    public async getVulnerabilityScanLogs(namespace: string, logPod: string): Promise<any> {

        try {
            const logs = await this.coreV1Api.readNamespacedPodLog(logPod, namespace, undefined, false);
            return logs.body;
        } catch (error) {
            console.log(error);
            console.log('ERROR fetching scan logs');
        }
    }

    public async getLatestPodByLabel(namespace: string, label: string ): Promise<any> {

        try {
            const pods = await this.coreV1Api.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, label);
            let latestPod = null;
            for (let i = 0; i < pods.body.items.length; i++) {
                const pod = pods.body.items[i];
                if (latestPod === null) {
                    latestPod = pod;
                } else {
                    if (
                        pod.metadata?.creationTimestamp && latestPod.metadata?.creationTimestamp &&
                        pod.metadata?.creationTimestamp > latestPod.metadata?.creationTimestamp) {
                        latestPod = pod;
                    }
                }
            }

            return {
                name: latestPod?.metadata?.name,
                status: latestPod?.status?.phase,
                startTime: latestPod?.status?.startTime,
                containerStatuses: latestPod?.status?.containerStatuses

            };

            //return latestPod?.metadata?.name
        } catch (error) {
            console.log(error);
            console.log('ERROR fetching pod by label');
        }
    }
/*
    public async createBuild(
        namespace: string,
        appName: string, 
        pipelineName: string,
        buildstrategy: 'buildpacks' | 'dockerfile' | 'nixpacks' | 'plain',
        dockerfilePath: string | undefined,
        git: {
            url: string,
            ref: string
        },
        repository: {
            image: string,
            tag: string
        }
        ): Promise<any> {
            //console.log('Build image: ', `${pipelineName}/${appName}:${git.ref}`);
            //console.log('Docker repo: ', repository.image+':' + repository.tag);


            // Format to date YYYYMMDD-HHMM
            const date = new Date();
            const id = date.toISOString().replace(/[-:]/g, '').replace(/[T]/g, '-').substring(0, 13);

            const name = appName + "-" + pipelineName + "-" + id;

            const build = {
                apiVersion: "application.kubero.dev/v1alpha1",
                kind: "KuberoBuild",
                metadata: {
                    name: name.substring(0, 53), // max 53 characters allowed within kubernetes
                },
                spec: {
                    buildstrategy: buildstrategy, // "buildpack" or "docker" or "nixpack"
                    app: appName,
                    pipeline: pipelineName,
                    id: id,
                    repository: {
                        image: repository.image,  // registry.yourdomain.com/name/namespace
                        tag: repository.tag + "-" + id
                    },
                    git: {
                        url: git.url,
                        ref: git.ref
                    },
                    buildpack: {
                        path: dockerfilePath,
                        cnbPlatformApi: "0.13",
                    },
                    dockerfile: {
                        path: dockerfilePath,
                    },
                    nixpack: {
                        path: dockerfilePath || ".nixpacks/Dockerfile",
                    },
                }
            };

            try {
                this.customObjectsApi.createNamespacedCustomObject(
                    "application.kubero.dev",
                    "v1alpha1",
                    namespace,
                    "kuberobuilds",
                    build
                ).catch(error => {
                    debug.log(error);
                });
            } catch (error) {
                console.log(error);
                console.log('ERROR creating build job');
            }
        }
*/
    public async deployApp(namespace: string, appName: string, tag: string) {

        let deploymentName = appName+'-kuberoapp-web';
        console.log("deploy app: " + appName, ",namespace: " + namespace, ",tag: " + tag, ",deploymentName: " + deploymentName);

        // format : https://jsonpatch.com/
        const patch = [
            {
              op: 'replace',
              path: '/spec/image/tag',
              value: tag,
            },
          ];

        const apiVersion = "v1alpha1"
        const group = "application.kubero.dev"
        const plural = "kuberoapps"

        const options = { "headers": { "Content-type": 'application/json-patch+json' } };
        this.customObjectsApi.patchNamespacedCustomObject(
            group,
            apiVersion,
            namespace,
            plural,
            appName,
            patch,
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
    
    public async getAllIngress(): Promise<any> {
        const ingresses = await this.networkingV1Api.listIngressForAllNamespaces();
        return ingresses.body.items;
    }

    public async execInContainer(namespace: string, podName: string, containerName: string, command: string, stdin: internal.PassThrough): Promise<WebSocket> {
        //const command = ['ls', '-al', '.']
        //const command = ['bash']
        //const command = "bash"
        const ws = await this.exec.exec(
            namespace,
            podName,
            containerName,
            command,
            process.stdout as stream.Writable,
            process.stderr as stream.Writable,
            stdin,
            true
        );
        return ws
    }

/*
    public async getKuberoconfig(): Promise<V1ConfigMap | void> {
        const namespace = process.env.KUBERO_NAMESPACE || "kubero"
        try {
            const config = await this.coreV1Api.readNamespacedConfigMap(
                'kubero-config',
                namespace
            )
            return config.body;
        } catch (error) {
            console.log(error);
            debug.log("getKuberoconfig: error getting config");
        }
    }
*/

    public async getKuberoConfig(namespace: string): Promise<any> {
        try {
            const config = await this.customObjectsApi.getNamespacedCustomObject(
                'application.kubero.dev',
                'v1alpha1',
                namespace,
                'kuberoes',
                'kubero'
            )
            //console.log(config.body);
            return config.body;
        } catch (error) {
            debug.log(error);
            debug.log("getKuberoConfig: error getting config");
        }
    }


    public async updateKuberoConfig(namespace: string, config: any) {
        const patch = [
            {
              op: 'replace',
              path: '/spec',
              value: config.spec,
            },
        ];

        const options = { "headers": { "Content-type": 'application/json-patch+json' } };
        try {
            await this.customObjectsApi.patchNamespacedCustomObject(
                'application.kubero.dev',
                'v1alpha1',
                namespace,
                'kuberoes',
                'kubero',
                patch,
                undefined,
                undefined,
                undefined,
                options
            )
        } catch (error) {
            debug.log(error);
        }
    }

    public async updateKuberoSecret(namespace: string, secret: any) {

        const patch = [
            {
              op: 'replace',
              path: '/stringData',
              value: secret,
            },
        ];

        const options = { "headers": { "Content-type": 'application/json-patch+json' } };
        try {
            await this.coreV1Api.patchNamespacedSecret(
                'kubero-secrets',
                namespace,
                patch,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                options
            )
        } catch (error) {
            debug.log(error);
        }
    }

    public async createBuildJob(
        namespace: string,
        appName: string, 
        pipelineName: string,
        buildstrategy: 'buildpacks' | 'dockerfile' | 'nixpacks' | 'plain',
        dockerfilePath: string | undefined,
        git: {
            url: string,
            ref: string
        },
        repository: {
            image: string,
            tag: string
        }
        ): Promise<any> {
        let job = loadJob(buildstrategy) as any

        const id = new Date().toISOString().replace(/[-:]/g, '').replace(/[T]/g, '-').substring(0, 13);
        const name = appName + "-" + pipelineName + "-" + id;

        job.metadata.name = name.substring(0, 53); // max 53 characters allowed within kubernetes
        //job.metadata.namespace = namespace;
        job.metadata.labels['job-name'] = name.substring(0, 53);
        job.metadata.labels['batch.kubernetes.io/job-name'] = name.substring(0, 53);
        job.metadata.labels['kuberoapp'] = appName;
        job.metadata.labels['kuberopipeline'] = pipelineName;
        job.spec.template.metadata.labels['job-name'] = name.substring(0, 53);
        job.spec.template.metadata.labels['batch.kubernetes.io/job-name'] = name.substring(0, 53);
        job.spec.template.metadata.labels['kuberoapp'] = appName;
        job.spec.template.metadata.labels['kuberopipeline'] = pipelineName;
        job.spec.template.spec.serviceAccountName = appName+'-kuberoapp';
        job.spec.template.spec.serviceAccount = appName+'-kuberoapp';
        job.spec.template.spec.initContainers[0].env[0].value = git.url;
        job.spec.template.spec.initContainers[0].env[1].value = git.ref;
        job.spec.template.spec.containers[0].env[0].value = repository.image
        job.spec.template.spec.containers[0].env[1].value = repository.tag+"-"+id;
        job.spec.template.spec.containers[0].env[2].value = appName;

        if (buildstrategy === 'buildpacks') {
            // configure build container
            job.spec.template.spec.initContainers[2].args[1] = repository.image+":"+repository.tag+"-"+id;
        }
        if (buildstrategy === 'dockerfile') {
            // configure push container
            job.spec.template.spec.initContainers[1].env[1].value = repository.image+":"+repository.tag+"-"+id;
            job.spec.template.spec.initContainers[1].env[2].value = dockerfilePath;
        }
        if (buildstrategy === 'nixpacks') {
            // configure push container
            job.spec.template.spec.initContainers[2].env[1].value = repository.image+":"+repository.tag+"-"+id;
            job.spec.template.spec.initContainers[2].env[2].value = dockerfilePath;
        }

        console.log("create build job: " + job);

        try {
            return await this.batchV1Api.createNamespacedJob(namespace, job);
        } catch (error) {
            console.log(error);
            console.log('ERROR creating build job');
        }
    }

    public async deleteKuberoBuildJob(namespace: string, buildName: string) {
        try {
            await this.batchV1Api.deleteNamespacedJob(buildName, namespace)
        } catch (error) {
            debug.log(error);
        }
    }


    public async getJob(namespace: string, jobName: string): Promise<any> {
        try {
            const job = await this.batchV1Api.readNamespacedJob(jobName, namespace)
            return job.body;
        } catch (error) {
            debug.log(error);
            debug.log("getJob: error getting job");
        }
    }

    public async getJobs(namespace: string): Promise<any> {
        try {
            const jobs = await this.batchV1Api.listNamespacedJob(namespace)
            return jobs.body;
        } catch (error) {
            debug.log(error);
            debug.log("getJobs: error getting jobs");
        }
    }
}