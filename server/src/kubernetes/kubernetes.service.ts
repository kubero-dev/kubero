import { Injectable, Logger } from '@nestjs/common';
import {
  IKubectlPipelineList,
  IKubectlPipeline,
  IKubectlAppList,
  IKubectlApp,
  IStorageClass,
} from './kubernetes.interface';
import { IPipeline, IRegistry } from '../pipelines/pipelines.interface';
import { KubectlPipeline } from '../pipelines/pipeline/pipeline';
import { KubectlApp, App } from '../apps/app/app';
import { dockerfileTemplate } from '../deployments/templates/dockerfile.yaml';
import { nixpacksTemplate } from '../deployments/templates/nixpacks.yaml';
import { buildpacksTemplate } from '../deployments/templates/buildpacks.yaml';

import {
  KubeConfig,
  Exec,
  VersionApi,
  CoreV1Api,
  AppsV1Api,
  CustomObjectsApi,
  VersionInfo,
  PatchUtils,
  Log as KubeLog,
  V1Pod,
  CoreV1Event,
  CoreV1EventList,
  V1Namespace,
  Metrics,
  NodeMetric,
  StorageV1Api,
  BatchV1Api,
  NetworkingV1Api,
  V1Job,
} from '@kubernetes/client-node';
import { WebSocket } from 'ws';
import stream from 'stream';
import internal from 'stream';

@Injectable()
export class KubernetesService {
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
  private readonly logger = new Logger(KubernetesService.name);
  private YAML = require('yaml');

  constructor() {
    this.kc = new KubeConfig();
    this.log = new KubeLog(this.kc);
    this.kubeVersion = new VersionInfo();
    this.initKubeConfig();
  }

  private async initKubeConfig() {
    //this.config = config;
    //this.kc.loadFromDefault(); // should not be used since we want also load from base64 ENV var

    if (process.env.KUBECONFIG_BASE64) {
      const buff = Buffer.from(process.env.KUBECONFIG_BASE64, 'base64');
      const kubeconfig = buff.toString('ascii');
      this.kc.loadFromString(kubeconfig);

      this.logger.debug('ℹ️  Kubeconfig loaded from base64');
    } else if (process.env.KUBECONFIG_PATH) {
      this.kc.loadFromFile(process.env.KUBECONFIG_PATH);
      this.logger.debug(
        'ℹ️  Kubeconfig loaded from file ' + process.env.KUBECONFIG_PATH,
      );
    } else {
      try {
        this.kc.loadFromCluster();
        this.logger.debug('ℹ️  Kubeconfig loaded from cluster');
      } catch (_error) {
        this.logger.error('❌ Error loading from cluster');
        //this.logger.debug(error);
      }
    }

    try {
      this.versionApi = this.kc.makeApiClient(VersionApi);
      this.coreV1Api = this.kc.makeApiClient(CoreV1Api);
      this.appsV1Api = this.kc.makeApiClient(AppsV1Api);
      this.storageV1Api = this.kc.makeApiClient(StorageV1Api);
      this.batchV1Api = this.kc.makeApiClient(BatchV1Api);
      this.networkingV1Api = this.kc.makeApiClient(NetworkingV1Api);
      this.metricsApi = new Metrics(this.kc);
      this.patchUtils = new PatchUtils();
      this.exec = new Exec(this.kc);
      this.customObjectsApi = this.kc.makeApiClient(CustomObjectsApi);
    } catch (_error) {
      this.logger.error(
        '❌ Error creating api clients. Check kubeconfig, cluster connectivity and context',
      );
      //this.logger.debug(error);
      this.kubeVersion = void 0;
      return;
    }

    this.loadKubeVersion()
      .then((v) => {
        if (v && v.gitVersion) {
          this.logger.debug('ℹ️  Kube version: ' + v.gitVersion);
        } else {
          this.logger.error('❌ Failed to get Kubernetes version');
          process.env.KUBERO_SETUP = 'enabled';
        }
        this.kubeVersion = v;
      })
      .catch((_error) => {
        this.logger.error('❌ Failed to get Kubernetes version');
        //this.logger.debug(error);
      });

    await this.loadOperatorVersion().then((v) => {
      this.logger.debug('ℹ️  Operator version: ' + v);
      this.kuberoOperatorVersion = v || 'unknown';
    });
  }

  public getKubeVersion(): VersionInfo | void {
    return this.kubeVersion;
  }

  public getKubernetesVersion(): string {
    return this.kubeVersion?.gitVersion || 'unknown';
  }

  public async loadKubeVersion(): Promise<VersionInfo | void> {
    // TODO and WARNING: This does not respect the context set by the user!
    try {
      const versionInfo = await this.versionApi.getCode();
      //debug.debug(JSON.stringify(versionInfo.body));
      return versionInfo.body;
    } catch (_error) {
      this.logger.debug('getKubeVersion: error getting kube version');
      //this.logger.debug(error);
    }
  }

  public getOperatorVersion(): string | undefined {
    return this.kuberoOperatorVersion;
  }

  private async loadOperatorVersion(): Promise<string | void> {
    const contextName = this.getCurrentContext();
    const namespace = 'kubero-operator-system';

    if (contextName) {
      const pods = await this.getPods(namespace, contextName).catch((error) => {
        this.logger.debug('❌ Failed to get Operator Version');
        //this.logger.debug(error);
        //return 'error';
      });
      if (pods) {
        for (const pod of pods) {
          if (
            pod?.metadata?.name?.startsWith(
              'kubero-operator-controller-manager',
            )
          ) {
            const container = pod?.spec?.containers.filter(
              (c: any) => c.name == 'manager',
            )[0];
            return container?.image?.split(':')[1] || 'unknown';
          }
        }
      } else {
        return 'error getting operator version';
      }
    }
  }

  public getContexts() {
    return this.kc.getContexts();
  }

  public setCurrentContext(context: string) {
    this.kc.setCurrentContext(context);
  }

  public getCurrentContext() {
    return this.kc.getCurrentContext();
  }

  public async getNamespaces(): Promise<V1Namespace[]> {
    const namespaces = await this.coreV1Api.listNamespace();
    return namespaces.body.items;
  }

  public async getPipelinesList(
    userGroups: string[] = [],
  ): Promise<IKubectlPipelineList> {
    this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
    let pipelines = {} as IKubectlPipelineList;
    pipelines.items = [];
    try {
      const ps = await this.customObjectsApi.listNamespacedCustomObject(
        'application.kubero.dev',
        'v1alpha1',
        process.env.KUBERO_NAMESPACE || 'kubero',
        'kuberopipelines',
      );
      pipelines = ps.body as IKubectlPipelineList;
      //return pipelines.body as IKubectlPipelineList;
    } catch (_error) {
      //this.logger.debug(error);
      this.logger.debug('❌ getPipelinesList: error getting pipelines!');
    }
    if (pipelines.items.length > 0) {
      // Filter pipelines based on user groups

      pipelines.items = pipelines.items.filter((pipeline) => {
        if (!pipeline.spec || !pipeline.spec.access) return true; //true=keep, when no access defined for better backward compatibility

        // return all, when user is in admin group
        if (userGroups.includes('admin')) return true;

        const accessGroups = pipeline.spec.access.teams || [];
        return accessGroups.some((group) => userGroups.includes(group));
      });
    }

    return pipelines;
  }

  public async createPipeline(pl: IPipeline) {
    this.logger.debug('create pipeline: ' + pl.name);
    const pipeline = new KubectlPipeline(pl);

    this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
    await this.customObjectsApi
      .createNamespacedCustomObject(
        'application.kubero.dev',
        'v1alpha1',
        process.env.KUBERO_NAMESPACE || 'kubero',
        'kuberopipelines',
        pipeline,
      )
      .catch((error) => {
        this.logger.debug('❌ Error creating pipeline: ' + pl.name);
        //this.logger.debug(error);
      });
  }

  public async updatePipeline(pl: IPipeline, resourceVersion: string) {
    this.logger.debug('update pipeline: ' + pl.name);
    const pipeline = new KubectlPipeline(pl);
    pipeline.metadata.resourceVersion = resourceVersion;

    this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
    await this.customObjectsApi
      .replaceNamespacedCustomObject(
        'application.kubero.dev',
        'v1alpha1',
        process.env.KUBERO_NAMESPACE || 'kubero',
        'kuberopipelines',
        pl.name,
        pipeline,
      )
      .catch((error) => {
        this.logger.debug('❌ Error updating pipeline: ' + pl.name);
        //this.logger.debug(error);
      });
  }

  public async deletePipeline(pipelineName: string) {
    this.logger.debug('delete pipeline: ' + pipelineName);
    this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
    await this.customObjectsApi
      .deleteNamespacedCustomObject(
        'application.kubero.dev',
        'v1alpha1',
        process.env.KUBERO_NAMESPACE || 'kubero',
        'kuberopipelines',
        pipelineName,
      )
      .catch((error) => {
        // this.logger.debug(error);
      });
  }

  public async getPipeline(pipelineName: string): Promise<IKubectlPipeline> {
    this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
    const pipeline = await this.customObjectsApi
      .getNamespacedCustomObject(
        'application.kubero.dev',
        'v1alpha1',
        process.env.KUBERO_NAMESPACE || 'kubero',
        'kuberopipelines',
        pipelineName,
      )
      .catch((error) => {
        //this.logger.debug(error);
        this.logger.debug('getPipeline: error getting pipeline');
        throw error;
      });
    if (pipeline) {
      return pipeline.body as IKubectlPipeline;
    } else {
      throw new Error('Pipeline not found');
      //return {} as IKubectlPipeline;
    }
  }

  public async createApp(app: App, context: string) {
    this.logger.debug('create app: ' + app.name);
    this.kc.setCurrentContext(context);

    const appl = new KubectlApp(app);

    const namespace = app.pipeline + '-' + app.phase;

    await this.customObjectsApi
      .createNamespacedCustomObject(
        'application.kubero.dev',
        'v1alpha1',
        namespace,
        'kuberoapps',
        appl,
      )
      .catch((error) => {
        console.log(error);
      });
  }

  public async updateApp(app: App, resourceVersion: string, context: string) {
    this.logger.debug('update app: ' + app.name);
    this.kc.setCurrentContext(context);

    const appl = new KubectlApp(app);
    appl.metadata.resourceVersion = resourceVersion;

    const namespace = app.pipeline + '-' + app.phase;

    await this.customObjectsApi
      .replaceNamespacedCustomObject(
        //await this.customObjectsApi.patchNamespacedCustomObject(
        // patch : https://stackoverflow.com/questions/67520468/patch-k8s-custom-resource-with-kubernetes-client-node
        // https://github.com/kubernetes-client/javascript/blob/master/examples/patch-example.js
        'application.kubero.dev',
        'v1alpha1',
        namespace,
        'kuberoapps',
        app.name,
        appl,
      )
      .catch((error) => {
        // this.logger.debug(error);
      });
  }

  public async deleteApp(
    pipelineName: string,
    phaseName: string,
    appName: string,
    context: string,
  ) {
    this.logger.debug('delete app: ' + appName);

    const namespace = pipelineName + '-' + phaseName;
    this.kc.setCurrentContext(context);

    await this.customObjectsApi
      .deleteNamespacedCustomObject(
        'application.kubero.dev',
        'v1alpha1',
        namespace,
        'kuberoapps',
        appName,
      )
      .catch((error) => {
        // this.logger.debug(error);
      });
  }

  public async getApp(
    pipelineName: string,
    phaseName: string,
    appName: string,
    context: string,
  ): Promise<IKubectlApp> {
    const namespace = pipelineName + '-' + phaseName;
    this.kc.setCurrentContext(context);

    const app = await this.customObjectsApi
      .getNamespacedCustomObject(
        'application.kubero.dev',
        'v1alpha1',
        namespace,
        'kuberoapps',
        appName,
      )
      .catch((error) => {
        // this.logger.debug(error);
      });

    if (app) {
      return app.body as IKubectlApp;
    } else {
      return {} as IKubectlApp;
    }
  }

  public async getAppsList(
    namespace: string,
    context: string,
  ): Promise<IKubectlAppList> {
    this.kc.setCurrentContext(context);
    try {
      const appslist = await this.customObjectsApi.listNamespacedCustomObject(
        'application.kubero.dev',
        'v1alpha1',
        namespace,
        'kuberoapps',
      );
      return appslist.body as IKubectlAppList;
    } catch (_error) {
      //this.logger.debug(error);
      this.logger.debug('getAppsList: error getting apps');
    }
    const appslist = {} as IKubectlAppList;
    appslist.items = [];
    return appslist;
  }

  public async getAllAppsList(context: string): Promise<IKubectlAppList> {
    this.kc.setCurrentContext(context);
    try {
      const appslist = await this.customObjectsApi.listClusterCustomObject(
        'application.kubero.dev',
        'v1alpha1',
        'kuberoapps',
      );
      return appslist.body as IKubectlAppList;
    } catch (_error) {
      //this.logger.debug(error);
      this.logger.debug('getAppsList: error getting apps');
    }
    const appslist = {} as IKubectlAppList;
    appslist.items = [];
    return appslist;
  }

  public async restartApp(
    pipelineName: string,
    phaseName: string,
    appName: string,
    workloadType: string,
    context: string,
  ) {
    this.logger.debug('restart app: ' + appName);
    this.kc.setCurrentContext(context);

    const namespace = pipelineName + '-' + phaseName;
    const deploymentName = appName + '-kuberoapp-' + workloadType;
    const date = new Date();

    // format : https://jsonpatch.com/
    const patch = [
      {
        op: 'add',
        path: '/spec/restartedAt',
        value: {
          restartedAt: date.toISOString(),
        },
      },
    ];

    const apiVersion = 'v1alpha1';
    const group = 'application.kubero.dev';
    const plural = 'kuberoapps';

    const options = {
      headers: { 'Content-type': 'application/json-patch+json' },
    };
    try {
      await this.customObjectsApi.patchNamespacedCustomObject(
        group,
        apiVersion,
        namespace,
        plural,
        appName,
        patch,
        undefined,
        undefined,
        undefined,
        options,
      );
      this.logger.debug(
        `Deployment ${deploymentName} in Pipeline ${namespace} updated`,
      );
    } catch (error) {
      if (error.body.message) {
        this.logger.debug('ERROR: ' + error.body.message);
      }
      this.logger.debug('ERROR: ' + error);
    }
  }

  public async getOperators() {
    // TODO list operators from all clusters
    let operators = { items: [] };
    try {
      const response = await this.customObjectsApi.listNamespacedCustomObject(
        'operators.coreos.com',
        'v1alpha1',
        'operators',
        'clusterserviceversions',
      );
      //let operators = response.body as KubernetesListObject<KubernetesObject>;
      operators = response.body as any; // TODO : fix type. This is a hacky way to get the type to work
    } catch (_error) {
      //this.logger.debug(error);
      this.logger.debug('error getting operators');
    }

    return operators.items;
  }

  public async getCustomresources() {
    // TODO list operators from all clusters
    let operators = { items: [] };
    try {
      const response = await this.customObjectsApi.listClusterCustomObject(
        'apiextensions.k8s.io',
        'v1',
        'customresourcedefinitions',
      );
      operators = response.body as any; // TODO : fix type. This is a hacky way to get the type to work
    } catch (error: any) {
      //this.logger.debug(error);
      this.logger.debug('error getting customresources');
    }

    return operators.items;
  }

  public async getPods(namespace: string, context: string): Promise<V1Pod[]> {
    const pods = await this.coreV1Api.listNamespacedPod(namespace);
    return pods.body.items;
  }

  public async createEvent(
    type: 'Normal' | 'Warning',
    reason: string,
    eventName: string,
    message: string,
  ) {
    this.logger.debug('create event: ' + eventName);

    const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days in the future //TODO make this configurable
    const event = new CoreV1Event();
    event.apiVersion = 'v1';
    event.kind = 'Event';
    event.type = type;
    event.message = message;
    event.reason = reason;
    event.metadata = {
      name: eventName + '.' + Date.now().toString(),
      namespace: process.env.KUBERO_NAMESPACE || 'kubero',
    };
    event.involvedObject = {
      kind: 'Kubero',
      namespace: process.env.KUBERO_NAMESPACE || 'kubero',
    };

    await this.coreV1Api
      .createNamespacedEvent(process.env.KUBERO_NAMESPACE || 'kubero', event)
      .catch((error) => {
        // this.logger.debug(error);
      });
  }

  public async getEvents(namespace: string): Promise<CoreV1Event[]> {
    try {
      const events = await this.coreV1Api.listNamespacedEvent(namespace);
      return events.body.items;
    } catch (_error) {
      //this.logger.debug(error);
      this.logger.debug('getEvents: error getting events');
    }
    const events = {} as CoreV1EventList;
    events.items = [];
    return events.items;
  }

  public async getPodMetrics(namespace: string, appName: string): Promise<any> {
    //TODO make this a real type
    const ret: {
      name: string;
      namespace: string;
      memory: {
        unit: string;
        request: number;
        limit: number;
        usage: number;
        percentage: number;
      };
      cpu: {
        unit: string;
        request: number;
        limit: number;
        usage: number;
        percentage: number;
      };
    }[] = [];

    try {
      const metrics = await this.metricsApi.getPodMetrics(namespace);

      for (let i = 0; i < metrics.items.length; i++) {
        const metric = metrics.items[i];

        if (!metric.metadata.name.startsWith(appName + '-')) continue;

        const pod = await this.coreV1Api.readNamespacedPod(
          metric.metadata.name,
          namespace,
        );
        const requestCPU = this.normalizeCPU(
          pod.body.spec?.containers[0].resources?.requests?.cpu || '0',
        );
        const requestMemory = this.normalizeMemory(
          pod.body.spec?.containers[0].resources?.requests?.memory || '0',
        );
        const limitsCPU = this.normalizeCPU(
          pod.body.spec?.containers[0].resources?.limits?.cpu || '0',
        );
        const limitsMemory = this.normalizeMemory(
          pod.body.spec?.containers[0].resources?.limits?.memory || '0',
        );
        const usageCPU = this.normalizeCPU(metric.containers[0].usage.cpu);
        const usageMemory = this.normalizeMemory(
          metric.containers[0].usage.memory,
        );
        const percentageCPU = Math.round((usageCPU / limitsCPU) * 100);
        const percentageMemory = Math.round((usageMemory / limitsMemory) * 100);

        /* debug caclulation */ /*
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
          memory: {
            unit: 'Mi',
            request: requestMemory,
            limit: limitsMemory,
            usage: usageMemory,
            percentage: percentageMemory,
          },
          cpu: {
            unit: 'm',
            request: requestCPU,
            limit: limitsCPU,
            usage: usageCPU,
            percentage: percentageCPU,
          },
        };
        ret.push(m);
      }
    } catch (error: any) {
      this.logger.debug('ERROR fetching metrics: ' + error);
    }

    return ret;
  }

  private normalizeCPU(resource: string): number {
    const regex = /([0-9]+)([a-zA-Z]*)/;
    const matches = resource.match(regex);

    let value = 0;
    let unit = '';
    if (matches !== null && matches[1]) {
      value = parseInt(matches[1]);
    }
    if (matches !== null && matches[2]) {
      unit = matches[2];
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
      value = parseInt(matches[1]);
    }
    if (matches !== null && matches[2]) {
      unit = matches[2];
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

  public async getPodUptimes(namespace: string): Promise<object> {
    const pods = await this.coreV1Api.listNamespacedPod(namespace);
    const ret = Object();
    for (let i = 0; i < pods.body.items.length; i++) {
      const pod = pods.body.items[i];
      const uptime = this.getPodUptimeMS(pod);
      if (pod.metadata && pod.metadata.name) {
        ret[pod.metadata.name] = {
          ms: uptime,
          formatted: this.formatUptime(uptime),
        };
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
      return seconds + 's';
    }
    if (uptime < 600000) {
      const minutes = Math.floor(uptime / (1000 * 60));
      const seconds = Math.floor((uptime - minutes * 1000 * 60) / 1000);
      if (seconds > 0) {
        return minutes + 'm' + seconds + 's';
      }
      return minutes + 'm';
    }
    if (uptime < 7200000) {
      const minutes = Math.floor(uptime / (1000 * 60));
      return minutes + 'm';
    }
    if (uptime < 172800000) {
      const hours = Math.floor(uptime / (1000 * 60 * 60));
      const minutes = Math.floor(
        (uptime - hours * 1000 * 60 * 60) / (1000 * 60),
      );
      if (minutes > 0) {
        return hours + 'h' + minutes + 'm';
      }
      return hours + 'h';
    }
    //if (uptime < 2592000000) {
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (uptime - days * 1000 * 60 * 60 * 24) / (1000 * 60 * 60),
    );
    if (hours > 0) {
      return days + 'd' + hours + 'h';
    }
    return days + 'd';
    //}
  }

  public async getStorageClasses(): Promise<IStorageClass[]> {
    const ret: IStorageClass[] = [];
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
        } as IStorageClass;
        ret.push(storageClass);
      }
    } catch (error) {
      this.logger.error(error);
      this.logger.error('ERROR fetching storageclasses');
    }
    return ret;
  }

  public async getIngressClasses(): Promise<object[]> {
    // undefind = default
    const ret = [
      {
        name: undefined,
      },
    ] as object[];
    try {
      const ingressClasses = await this.networkingV1Api.listIngressClass();
      for (let i = 0; i < ingressClasses.body.items.length; i++) {
        const ic = ingressClasses.body.items[i];
        const ingressClass = {
          name: ic.metadata?.name,
        };
        ret.push(ingressClass);
      }
    } catch (error) {
      this.logger.error(error);
      this.logger.error('ERROR fetching ingressclasses');
    }
    return ret;
  }

  private async deleteScanJob(namespace: string, name: string): Promise<any> {
    try {
      await this.batchV1Api.deleteNamespacedJob(name, namespace);
      // wait for job to be deleted
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (_error) {
      //console.log(error);
      this.logger.error('ERROR deleting job: ' + name + ' ' + namespace);
    }
  }

  public async createScanRepoJob(
    namespace: string,
    app: string,
    gitrepo: string,
    branch: string,
  ): Promise<any> {
    await this.deleteScanJob(namespace, app + '-kuberoapp-vuln');
    const job = {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        name: app + '-kuberoapp-vuln',
        namespace: namespace,
      },
      spec: {
        ttlSecondsAfterFinished: 86400,
        completions: 1,
        template: {
          metadata: {
            labels: {
              vulnerabilityscan: app,
            },
          },
          spec: {
            restartPolicy: 'Never',
            securityContext: {
              runAsUser: 1000,
            },
            containers: [
              {
                name: 'trivy-repo-scan',
                image: 'aquasec/trivy:latest',
                command: [
                  'trivy',
                  'repo',
                  gitrepo,
                  '--branch',
                  branch,
                  '-q',
                  '-f',
                  'json',
                  '--scanners',
                  'vuln,secret,config',
                  '--cache-dir',
                  '/tmp/trivy',
                  '--exit-code',
                  '0',
                ],
              },
            ],
          },
        },
      },
    };
    try {
      return await this.batchV1Api.createNamespacedJob(namespace, job);
    } catch (error) {
      this.logger.error(error);
      this.logger.error(
        'ERROR creating Repo scan job: ' + app + ' ' + namespace,
      );
    }
  }

  public async createScanImageJob(
    namespace: string,
    app: string,
    image: string,
    tag: string,
    withCredentials: boolean,
  ): Promise<any> {
    await this.deleteScanJob(namespace, app + '-kuberoapp-vuln');
    const job = {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        name: app + '-kuberoapp-vuln',
        namespace: namespace,
      },
      spec: {
        ttlSecondsAfterFinished: 86400,
        completions: 1,
        backoffLimit: 1,
        template: {
          metadata: {
            labels: {
              vulnerabilityscan: app,
            },
          },
          spec: {
            restartPolicy: 'Never',
            securityContext: {
              runAsUser: 1000,
            },
            containers: [
              {
                name: 'trivy-repo-scan',
                image: 'aquasec/trivy:latest',
                command: [
                  'trivy',
                  'image',
                  image + ':' + tag,
                  '-q',
                  '-f',
                  'json',
                  '--scanners',
                  'vuln',
                  '--cache-dir',
                  '/tmp/trivy',
                  '--exit-code',
                  '0',
                ],
                env: [] as {
                  name: string;
                  valueFrom: {
                    secretKeyRef: { name: string; key: string; optional: true };
                  };
                }[],
              },
            ],
          },
        },
      },
    };

    if (withCredentials) {
      job.spec.template.spec.containers[0].env = [
        {
          name: 'TRIVY_USERNAME',
          valueFrom: {
            secretKeyRef: {
              name: 'registry-credentials',
              key: 'username',
              optional: true,
            },
          },
        },
        {
          name: 'TRIVY_PASSWORD',
          valueFrom: {
            secretKeyRef: {
              name: 'registry-credentials',
              key: 'password',
              optional: true,
            },
          },
        },
      ];
    }

    try {
      return await this.batchV1Api.createNamespacedJob(namespace, job);
    } catch (error) {
      this.logger.error(error);
      this.logger.error('ERROR creating Image scan job');
    }
  }

  public async getVulnerabilityScanLogs(
    namespace: string,
    logPod: string,
  ): Promise<any> {
    try {
      const logs = await this.coreV1Api.readNamespacedPodLog(
        logPod,
        namespace,
        undefined,
        false,
      );
      return logs.body;
    } catch (error) {
      this.logger.error(error);
      this.logger.error('ERROR fetching scan logs');
    }
  }

  public async getLatestPodByLabel(
    namespace: string,
    label: string,
  ): Promise<any> {
    try {
      const pods = await this.coreV1Api.listNamespacedPod(
        namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        label,
      );
      let latestPod: V1Pod | null = null;
      for (let i = 0; i < pods.body.items.length; i++) {
        const pod = pods.body.items[i];
        if (latestPod === null) {
          latestPod = pod;
        } else {
          if (
            pod.metadata?.creationTimestamp &&
            latestPod.metadata?.creationTimestamp &&
            pod.metadata?.creationTimestamp >
              latestPod.metadata?.creationTimestamp
          ) {
            latestPod = pod;
          }
        }
      }

      return {
        name: latestPod?.metadata?.name,
        status: latestPod?.status?.phase,
        startTime: latestPod?.status?.startTime,
        containerStatuses: latestPod?.status?.containerStatuses,
      };

      //return latestPod?.metadata?.name
    } catch (error) {
      this.logger.error(error);
      this.logger.error('ERROR fetching pod by label');
    }
  }

  public deployApp(namespace: string, appName: string, tag: string) {
    const deploymentName = appName + '-kuberoapp-web';
    this.logger.error(
      'deploy app: ' + appName,
      ',namespace: ' + namespace,
      ',tag: ' + tag,
      ',deploymentName: ' + deploymentName,
    );

    // format : https://jsonpatch.com/
    const patch = [
      {
        op: 'replace',
        path: '/spec/image/tag',
        value: tag,
      },
    ];

    const apiVersion = 'v1alpha1';
    const group = 'application.kubero.dev';
    const plural = 'kuberoapps';

    const options = {
      headers: { 'Content-type': 'application/json-patch+json' },
    };
    this.customObjectsApi
      .patchNamespacedCustomObject(
        group,
        apiVersion,
        namespace,
        plural,
        appName,
        patch,
        undefined,
        undefined,
        undefined,
        options,
      )
      .then(() => {
        this.logger.debug(
          `Deployment ${deploymentName} in Pipeline ${namespace} updated`,
        );
      })
      .catch((error) => {
        if (error.body.message) {
          this.logger.debug('ERROR: ' + error.body.message);
        }
        this.logger.debug('ERROR: ' + error);
      });
  }

  public async getAllIngress(): Promise<any> {
    const ingresses = await this.networkingV1Api.listIngressForAllNamespaces();
    return ingresses.body.items;
  }

  public async getDomains(): Promise<any> {
    const allIngress = await this.getAllIngress();
    const domains: string[] = [];
    allIngress.forEach((ingress: any) => {
      ingress.spec.rules.forEach((rule: any) => {
        domains.push(rule.host);
      });
    });
    return domains;
  }

  public async execInContainer(
    namespace: string,
    podName: string,
    containerName: string,
    command: string,
    stdin: internal.PassThrough,
  ): Promise<WebSocket> {
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
      true,
    );
    return ws;
  }

  public async getKuberoConfig(namespace: string) {
    this.kc.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
    try {
      const config = await this.customObjectsApi.getNamespacedCustomObject(
        'application.kubero.dev',
        'v1alpha1',
        namespace,
        'kuberoes',
        'kubero',
      );
      //console.log(config.body);
      return config.body as any;
    } catch (error) {
      // this.logger.debug(error);
      this.logger.debug('getKuberoConfig: error getting config');
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

    const options = {
      headers: { 'Content-type': 'application/json-patch+json' },
    };
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
        options,
      );
    } catch (error) {
      // this.logger.debug(error);
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

    const options = {
      headers: { 'Content-type': 'application/json-patch+json' },
    };
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
        options,
      );
    } catch (error) {
      // this.logger.debug(error);
    }
  }

  private async makeDockerAuthConfig(
    registry: IRegistry,
    username: string,
    password: string,
  ) {
    const registryHost = registry.host;

    const authString = `${username}:${password}`;
    const authBase64 = Buffer.from(authString).toString('base64');

    const authConfig = {
      auths: {
        [registryHost]: {
          auth: authBase64,
        },
      },
    };

    return authConfig;
  }

  public async getSecret(
    secretName: string,
  ): Promise<{ [key: string]: string } | null> {
    const namespace = process.env.KUBERO_NAMESPACE || 'kubero';

    try {
      const secret = await this.coreV1Api.readNamespacedSecret(
        secretName,
        namespace,
      );

      if (!secret.body.data) {
        return null;
      }

      const decodedData: any = {};
      for (const [key, value] of Object.entries(secret.body.data)) {
        decodedData[key] = Buffer.from(value as string, 'base64').toString(
          'utf-8',
        );
      }

      return decodedData;
    } catch (error) {
      if (error.response?.body?.reason === 'NotFound') {
        return null;
      }
      throw error;
    }
  }

  public async upsertSecret(
    secretName: string,
    secretData: { [key: string]: string },
  ) {
    const namespace = process.env.KUBERO_NAMESPACE || 'kubero';
    const secretUpsertRequest = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: secretName,
      },
      type: 'Opaque',
      stringData: secretData,
    };

    try {
      await this.coreV1Api.replaceNamespacedSecret(
        secretName,
        namespace,
        secretUpsertRequest,
      );
    } catch (error) {
      if (error.response?.body?.reason === 'NotFound') {
        await this.coreV1Api.createNamespacedSecret(
          namespace,
          secretUpsertRequest,
        );
      } else {
        throw error;
      }
    }
  }

  private async createPushSecret(
    namespace: string,
    jobName: string,
    registryUsername: string,
    registryPassword: string,
  ) {
    const conf = await this.getKuberoConfig(
      process.env.KUBERO_NAMESPACE || 'kubero',
    );
    const secretName = 'push-' + jobName;

    const dockerauthconfig = await this.makeDockerAuthConfig(
      conf.spec.registry,
      registryUsername,
      registryPassword,
    );
    const pushSecret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: secretName,
      },
      type: 'kubernetes.io/dockerconfigjson',
      stringData: {
        '.dockerconfigjson': JSON.stringify(dockerauthconfig),
      },
    };

    try {
      await this.coreV1Api.replaceNamespacedSecret(
        secretName,
        namespace,
        pushSecret,
      );
    } catch (error) {
      if (error.response?.body?.reason === 'NotFound') {
        await this.coreV1Api.createNamespacedSecret(namespace, pushSecret);
      } else {
        throw error;
      }
    }

    return secretName;
  }

  public async createBuildJob(
    namespace: string,
    appName: string,
    pipelineName: string,
    buildstrategy: 'buildpacks' | 'dockerfile' | 'nixpacks' | 'plain',
    dockerfilePath: string | undefined,
    git: {
      url: string;
      ref: string;
    },
    repository: {
      registry: string;
      registryUsername: string;
      registryPassword: string;
      image: string;
      tag: string;
    },
    //job: any, //V1Job,
  ): Promise<any> {
    const job = this.loadJob(buildstrategy) as any;
    //const job = new Object() as any;

    const id = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/[T]/g, '-')
      .substring(0, 13);
    const name = appName + '-' + pipelineName + '-' + id;
    const secretName = await this.createPushSecret(
      namespace,
      name,
      repository.registryUsername,
      repository.registryPassword,
    );

    job.metadata.name = name.substring(0, 53); // max 53 characters allowed within kubernetes
    //job.metadata.namespace = namespace;
    job.metadata.labels['job-name'] = name.substring(0, 53);
    job.metadata.labels['batch.kubernetes.io/job-name'] = name.substring(0, 53);
    job.metadata.labels['kuberoapp'] = appName;
    job.metadata.labels['kuberopipeline'] = pipelineName;
    job.spec.template.metadata.labels['job-name'] = name.substring(0, 53);
    job.spec.template.metadata.labels['batch.kubernetes.io/job-name'] =
      name.substring(0, 53);
    job.spec.template.metadata.labels['kuberoapp'] = appName;
    job.spec.template.metadata.labels['kuberopipeline'] = pipelineName;
    job.spec.template.spec.serviceAccountName = appName + '-kuberoapp';
    job.spec.template.spec.serviceAccount = appName + '-kuberoapp';
    job.spec.template.spec.initContainers[0].env[0].value = git.url;
    job.spec.template.spec.initContainers[0].env[1].value = git.ref;
    const imageUrl = repository.registry + '/' + repository.image;
    job.spec.template.spec.containers[0].env[0].value = imageUrl;
    const tag = repository.tag + '-' + id;
    job.spec.template.spec.containers[0].env[1].value = tag;
    job.spec.template.spec.containers[0].env[2].value = appName;
    job.spec.template.spec.containers[0].env[3].value = JSON.stringify({
      spec: { image: { repository: imageUrl, tag: tag } },
    });
    job.spec.template.spec.volumes[2].secret.secretName = secretName;

    if (buildstrategy === 'buildpacks') {
      // configure build container
      job.spec.template.spec.initContainers[2].args[1] =
        imageUrl + ':' + repository.tag + '-' + id;
    }
    if (buildstrategy === 'dockerfile') {
      // configure push container
      job.spec.template.spec.initContainers[1].env[1].value =
        imageUrl + ':' + repository.tag + '-' + id;
      job.spec.template.spec.initContainers[1].env[2].value = dockerfilePath;
    }
    if (buildstrategy === 'nixpacks') {
      // configure push container
      job.spec.template.spec.initContainers[2].env[1].value =
        imageUrl + ':' + repository.tag + '-' + id;
      job.spec.template.spec.initContainers[2].env[2].value = dockerfilePath;
    }

    this.logger.log('create build job: ' + job);

    try {
      return await this.batchV1Api.createNamespacedJob(namespace, job);
    } catch (error) {
      this.logger.error(error);
      this.logger.error('ERROR creating build job');
    }
  }

  public async deleteKuberoBuildJob(namespace: string, buildName: string) {
    try {
      await this.batchV1Api.deleteNamespacedJob(buildName, namespace);
    } catch (error) {
      // this.logger.debug(error);
    }
  }

  public async getJob(namespace: string, jobName: string): Promise<any> {
    try {
      const job = await this.batchV1Api.readNamespacedJob(jobName, namespace);
      return job.body;
    } catch (error) {
      // this.logger.debug(error);
      this.logger.debug('getJob: error getting job');
    }
  }

  public async getJobs(namespace: string): Promise<any> {
    try {
      const jobs = await this.batchV1Api.listNamespacedJob(namespace);
      return jobs.body;
    } catch (error) {
      // this.logger.debug(error);
      this.logger.debug('getJobs: error getting jobs');
    }
  }

  public async validateKubeconfig(
    kubeconfig: string,
    kubeContext: string,
  ): Promise<{ error: any; valid: boolean }> {
    // validate config for setup process

    //let buff = Buffer.from(configBase64, 'base64');
    //const kubeconfig = buff.toString('ascii');

    const kc = new KubeConfig();
    kc.loadFromString(kubeconfig);
    kc.setCurrentContext(kubeContext);

    try {
      const versionApi = kc.makeApiClient(VersionApi);
      const versionInfo = await versionApi.getCode();
      this.logger.debug(JSON.stringify(versionInfo.body));
      return { error: null, valid: true };
    } catch (error: any) {
      this.logger.error('Error validating kubeconfig: ' + error);
      this.logger.error(error);
      return { error: error.message, valid: false };
    }
  }

  public updateKubectlConfig(kubeconfig: string, kubeContext: string) {
    // update kubeconfig in the kubectl instance
    /*
        this.kc.loadFromString(kubeconfig);
        this.kc.setCurrentContext(kubeContext);
        */
    this.initKubeConfig();
    this.logger.debug(kubeContext, this.kc.getCurrentContext());

    this.logger.log('Kubeconfig updated');
  }

  public async checkNamespace(namespace: string): Promise<boolean> {
    try {
      const ns = await this.coreV1Api.readNamespace(namespace);
      return true;
    } catch (_error) {
      return false;
    }
  }

  public async checkPod(namespace: string, podName: string): Promise<boolean> {
    try {
      const pod = await this.coreV1Api.readNamespacedPod(podName, namespace);
      return true;
    } catch (_error) {
      return false;
    }
  }

  public async checkDeployment(
    namespace: string,
    deploymentName: string,
  ): Promise<boolean> {
    try {
      const deployment = await this.appsV1Api.readNamespacedDeployment(
        deploymentName,
        namespace,
      );
      return true;
    } catch (_error) {
      return false;
    }
  }

  public async checkCustomResourceDefinition(plural: string): Promise<boolean> {
    try {
      const crd = await this.customObjectsApi.listClusterCustomObject(
        'apiextensions.k8s.io',
        'v1',
        plural,
      );
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  public async createNamespace(namespace: string): Promise<any> {
    const ns = {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: namespace,
      },
    };
    try {
      return await this.coreV1Api.createNamespace(ns);
    } catch (_error) {
      //console.log(error);
      this.logger.error('ERROR creating namespace');
    }
  }

  private loadJob(jobname: string): V1Job {
    const allowedJobNames = ['buildpacks', 'dockerfile', 'nixpacks', 'plain'];
    if (!allowedJobNames.includes(jobname)) {
      throw new Error(`Invalid job name: ${jobname}`);
    }

    let job = '';
    switch (jobname) {
      case 'buildpacks':
        job = buildpacksTemplate;
        break;
      case 'dockerfile':
        job = dockerfileTemplate;
        break;
      case 'nixpacks':
        job = nixpacksTemplate;
        break;
      default:
        break;
    }
    return this.YAML.parse(job) as V1Job;
  }
}
