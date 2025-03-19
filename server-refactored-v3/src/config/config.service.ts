import { Injectable, Logger } from '@nestjs/common';
import { IKuberoCRD, IKuberoConfig, IRegistry } from './config.interface';
import { KuberoConfig } from './kubero-config/kubero-config';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { readFileSync, writeFileSync } from 'fs';
import YAML from 'yaml';
import { join } from 'path';
import { Context } from '@kubernetes/client-node';
import { Buildpack } from './buildpack/buildpack';
import { PodSize } from './podsize/podsize';
import { INotification } from '../notifications/notifications.interface';
import { NotificationsService } from '../notifications/notifications.service';

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private runningConfig: IKuberoConfig;
  private features: { [key: string]: boolean } = {
    sleep: false,
    metrics: false,
    /* suggested features
        console: false,
        logs: false,
        audit: false,
        notifications: false,
        templates: false,
        addons: false,
        deployments: false,
        security: false,
        settings: false,
        */
  };

  constructor(
    private readonly kubectl: KubernetesService,
    private notification: NotificationsService,
  ) {
    this.reloadRunningConfig();
    this.runFeatureCheck();
  }

  // Load settings from a file or from kubernetes
  async getSettings(): Promise<KuberoConfig> {
    if (this.checkAdminDisabled()) {
      return new KuberoConfig(new Object() as IKuberoConfig);
    }

    // TODO: This might fail with a local filesystem config
    const config: any = {};
    const namespace = process.env.KUBERO_NAMESPACE || 'kubero';
    const kuberoes = await this.kubectl.getKuberoConfig(namespace);
    config.settings = kuberoes.spec;
    /*
        const kuberoconfig = await this.readConfig()
        config.settings = new KuberoConfig(kuberoconfig)
        */

    config['secrets'] = {
      GITHUB_BASEURL: process.env.GITHUB_BASEURL || '',
      GITHUB_PERSONAL_ACCESS_TOKEN:
        process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '',
      GITEA_PERSONAL_ACCESS_TOKEN:
        process.env.GITEA_PERSONAL_ACCESS_TOKEN || '',
      GITEA_BASEURL: process.env.GITEA_BASEURL || '',
      GITLAB_PERSONAL_ACCESS_TOKEN:
        process.env.GITLAB_PERSONAL_ACCESS_TOKEN || '',
      GITLAB_BASEURL: process.env.GITLAB_BASEURL || '',
      BITBUCKET_APP_PASSWORD: process.env.BITBUCKET_APP_PASSWORD || '',
      BITBUCKET_USERNAME: process.env.BITBUCKET_USERNAME || '',
      GOGS_PERSONAL_ACCESS_TOKEN: process.env.GOGS_PERSONAL_ACCESS_TOKEN || '',
      GOGS_BASEURL: process.env.GOGS_BASEURL || '',
      KUBERO_WEBHOOK_SECRET: process.env.KUBERO_WEBHOOK_SECRET || '',
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
      OAUTH2_CLIENT_SECRET: process.env.OAUTH2_CLIENT_SECRET || '',
    };
    return config;
  }

  public async updateSettings(config: any): Promise<KuberoConfig> {
    if (this.checkAdminDisabled()) {
      return new KuberoConfig({} as IKuberoConfig);
    }

    const namespace = process.env.KUBERO_NAMESPACE || 'kubero';
    const kuberoes = await this.kubectl.getKuberoConfig(namespace);
    kuberoes.spec = config.settings;

    // Write local config file in dev mode
    if (process.env.NODE_ENV != 'production') {
      console.log('DEV MODE: write local config');
      this.writeConfig(kuberoes.spec.kubero.config);
    }

    this.kubectl.updateKuberoConfig(namespace, kuberoes);
    this.kubectl.updateKuberoSecret(namespace, config.secrets);
    this.setEnv(config.secrets);

    const m = {
      name: 'updateSettings',
      user: '',
      resource: 'system',
      action: 'update',
      severity: 'normal',
      message: 'Kubero settings updated',
      pipelineName: '',
      phaseName: '',
      appName: '',
      data: {},
    } as INotification;
    this.notification.send(m);

    return kuberoes;
  }

  private setEnv(secrets: any) {
    /*
    for (const key in secrets) {
        process.env[key] = secrets[key]
    }
    */
    process.env.GITHUB_BASEURL = secrets.GITHUB_BASEURL;
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN =
      secrets.GITHUB_PERSONAL_ACCESS_TOKEN;
    process.env.GITEA_PERSONAL_ACCESS_TOKEN =
      secrets.GITEA_PERSONAL_ACCESS_TOKEN;
    process.env.GITEA_BASEURL = secrets.GITEA_BASEURL;
    process.env.GITLAB_PERSONAL_ACCESS_TOKEN =
      secrets.GITLAB_PERSONAL_ACCESS_TOKEN;
    process.env.GITLAB_BASEURL = secrets.GITLAB_BASEURL;
    process.env.BITBUCKET_APP_PASSWORD = secrets.BITBUCKET_APP_PASSWORD;
    process.env.BITBUCKET_USERNAME = secrets.BITBUCKET_USERNAME;
    process.env.GOGS_PERSONAL_ACCESS_TOKEN = secrets.GOGS_PERSONAL_ACCESS_TOKEN;
    process.env.GOGS_BASEURL = secrets.GOGS_BASEURL;
    process.env.KUBERO_WEBHOOK_SECRET = secrets.KUBERO_WEBHOOK_SECRET;
    process.env.GITHUB_CLIENT_SECRET = secrets.GITHUB_CLIENT_SECRET;
    process.env.OAUTH2_CLIENT_SECRET = secrets.OAUTH2_CLIENT_SECRET;
  }

  private reloadRunningConfig(): void {
    this.readConfig()
      .then((config) => {
        this.logger.debug('Kubero config loaded');
        this.runningConfig = config;
      })
      .catch((error) => {
        this.logger.error('Error reading kuberoes config');
        this.logger.error(error);
      });
  }

  private async readConfig(): Promise<IKuberoConfig> {
    if (process.env.NODE_ENV === 'production') {
      const kuberoCRD = await this.readConfigFromKubernetes();
      return kuberoCRD.kubero.config;
    } else {
      return this.readConfigFromFS();
    }
  }

  private async readConfigFromKubernetes(): Promise<IKuberoCRD> {
    const namespace = process.env.KUBERO_NAMESPACE || 'kubero';
    const kuberoes = await this.kubectl.getKuberoConfig(namespace);
    return kuberoes.spec;
  }

  private readConfigFromFS(): IKuberoConfig {
    // read config from local filesystem (dev mode)
    //const path = join(__dirname, 'config.yaml')
    const path =
      process.env.KUBERO_CONFIG_PATH || join(__dirname, 'config.yaml');
    let settings: string;
    try {
      settings = readFileSync(path, 'utf8');
      return YAML.parse(settings) as IKuberoConfig;
    } catch (e) {
      this.logger.error('Error reading config file');

      return new Object() as IKuberoConfig;
    }
  }

  // write config to local filesystem (dev mode)
  private writeConfig(configMap: KuberoConfig) {
    const path =
      process.env.KUBERO_CONFIG_PATH || join(__dirname, 'config.yaml');
    writeFileSync(path, YAML.stringify(configMap), {
      flag: 'w',
      encoding: 'utf8',
    });
  }

  public async getDefaultRegistry(): Promise<any> {
    let registry = process.env.KUBERO_REGISTRY || {
      account: {
        hash: '$2y$05$czQZpvtDYc5OzM/1r1pH0eAplT/okohh/mXoWl/Y65ZP/8/jnSWZq',
        password: 'kubero',
        username: 'kubero',
      },
      create: false,
      enabled: false,
      host: 'registry.demo.kubero.dev',
      port: 443,
      storage: '1Gi',
      storageClassName: null,
      subpath: '',
    };
    try {
      const namespace = process.env.KUBERO_NAMESPACE || 'kubero';
      const kuberoes = await this.kubectl.getKuberoConfig(namespace);
      registry = kuberoes.spec.registry;
    } catch (error) {
      this.logger.error('Error getting kuberoes config');
    }
    return registry;
  }

  public async getBanner(): Promise<any> {
    const defaultbanner = {
      show: false,
      text: '',
      bgcolor: 'white',
      fontcolor: 'white',
    };

    const banner = (await this.runningConfig.kubero?.banner) || defaultbanner;
    return banner;
  }

  public checkAdminDisabled(): boolean {
    return this.runningConfig.kubero.admin?.disabled || false;
  }

  public async validateKubeconfig(
    kubeConfig: string,
    kubeContext: string,
  ): Promise<any> {
    if (process.env.KUBERO_SETUP != 'enabled') {
      return {
        error: 'Setup is disabled. Set env KUBERO_SETUP=enabled and retry',
        status: 'error',
      };
    }
    return this.kubectl.validateKubeconfig(kubeConfig, kubeContext);
  }

  public updateRunningConfig(
    kubeConfig: string,
    kubeContext: string,
    kuberoNamespace: string,
    KuberoSessionKey: string,
    kuberoWebhookSecret: string,
  ): { error: string; status: string } {
    if (process.env.KUBERO_SETUP != 'enabled') {
      return {
        error: 'Setup is disabled. Set env KUBERO_SETUP=enabled and retry',
        status: 'error',
      };
    }

    process.env.KUBERO_CONTEXT = kubeContext;
    process.env.KUBERO_NAMESPACE = kuberoNamespace;
    process.env.KUBERO_SESSION_KEY = KuberoSessionKey;
    process.env.KUBECONFIG_BASE64 = kubeConfig;
    process.env.KUBERO_SETUP = 'disabled';

    this.kubectl.updateKubectlConfig(kubeConfig, kubeContext);

    this.kubectl.createNamespace(kuberoNamespace);
    return {
      error: '',
      status: 'ok',
    };
  }

  public async checkComponent(component: string): Promise<any> {
    const ret = {
      //reason : "Component not found",
      status: 'error',
    };

    if (component === 'operator') {
      //let operator = await this.kubectl.checkCustomResourceDefinition("kuberoes.application.kubero.dev")
      const operator = await this.kubectl.checkNamespace(
        'kubero-operator-system',
      );
      if (operator) {
        ret.status = 'ok';
      }
    }

    if (component === 'metrics') {
      const metrics = await this.kubectl.checkDeployment(
        'kube-system',
        'metrics-server',
      );
      if (metrics) {
        ret.status = 'ok';
      }
    }

    if (component === 'debug') {
      const metrics = await this.kubectl.checkNamespace('default');
      if (metrics) {
        ret.status = 'ok';
      }
    }

    if (component === 'ingress') {
      const ingress = await this.kubectl.checkNamespace('ingress-nginx');
      if (ingress) {
        ret.status = 'ok';
      }
    }

    return ret;
  }

  getBuildpipelineEnabled() {
    return process.env.KUBERO_BUILD_REGISTRY
      ? process.env.KUBERO_BUILD_REGISTRY != undefined
      : false;
  }

  getTemplateEnabled() {
    return this.runningConfig.templates?.enabled || false;
  }

  public async getTemplateConfig() {
    return this.runningConfig.templates;
  }

  getConsoleEnabled() {
    if (this.runningConfig.kubero?.console?.enabled == undefined) {
      return false;
    }
    return this.runningConfig.kubero?.console?.enabled;
  }

  setMetricsStatus(status: boolean) {
    this.features.metrics = status;
  }

  getMetricsEnabled(): boolean {
    return this.features.metrics;
  }

  checkMetricsEnabled(): boolean {
    return true;
  }

  private async checkForZeropod(): Promise<boolean> {
    // This is a very basic check for Zeropod. It requires the namespace zeropod-system to be present.
    // But it does not check if the Zeropod controller is complete and running.
    let enabled = false;
    try {
      const nsList = await this.kubectl.getNamespaces();
      for (const ns of nsList) {
        if (ns.metadata?.name == 'zeropod-system') {
          enabled = true;
        }
      }
    } catch (error) {
      this.logger.error('❌ getSleepEnabled: could not check for Zeropod');
      return false;
    }

    return enabled;
  }

  private async runFeatureCheck() {
    this.features.sleep = await this.checkForZeropod();
    this.features.metrics = await this.checkMetricsEnabled();
  }

  public getSleepEnabled(): boolean {
    return this.features.sleep;
  }

  public async getRegistry(): Promise<IRegistry> {
    const namespace = process.env.KUBERO_NAMESPACE || 'kubero';
    const kuberoes = await this.kubectl.getKuberoConfig(namespace);
    return kuberoes.spec.registry;
  }

  public getRunpacks(): any[] {
    return this.runningConfig.buildpacks || [];
  }

  public async getClusterIssuer(): Promise<{ clusterissuer: string }> {
    const namespace = process.env.KUBERO_NAMESPACE || 'kubero';
    const kuberoes = await this.kubectl.getKuberoConfig(namespace);
    if (kuberoes == undefined) {
      return { clusterissuer: 'not-configured' };
    }
    return {
      clusterissuer:
        kuberoes.spec.kubero.config.clusterissuer || 'not-configured',
    };
  }

  public async getBuildpacks() {
    const buildpackList: Buildpack[] = [];

    const namespace = process.env.KUBERO_NAMESPACE || 'kubero';
    const kuberoes = await this.kubectl.getKuberoConfig(namespace);

    for (const buildpack of kuberoes.spec.kubero.config.buildpacks) {
      const b = new Buildpack(buildpack);
      buildpackList.push(b);
    }

    return buildpackList;
  }

  public async getPodSizes() {
    const podSizeList: PodSize[] = [];

    const namespace = process.env.KUBERO_NAMESPACE || 'kubero';
    const kuberoes = await this.kubectl.getKuberoConfig(namespace);

    for (const podSize of kuberoes.spec.kubero.config.podSizeList) {
      const p = new PodSize(podSize);
      podSizeList.push(p);
    }

    return podSizeList;
  }

  public static getLocalauthEnabled(): boolean {
    let enabled = false;
    process.env.KUBERO_SESSION_KEY == undefined ||
    process.env.KUBERO_SESSION_KEY == ''
      ? (enabled = false)
      : (enabled = true);

    return enabled;
  }

  public static getGithubEnabled(): boolean {
    let enabled = false;
    process.env.GITHUB_CLIENT_SECRET == undefined ||
    process.env.GITHUB_CLIENT_ID == undefined ||
    process.env.GITHUB_CLIENT_CALLBACKURL == undefined ||
    process.env.GITHUB_CLIENT_ORG == undefined
      ? (enabled = false)
      : (enabled = true);

    return enabled;
  }

  public static getOauth2Enabled(): boolean {
    let enabled = false;
    process.env.OAUTO2_CLIENT_AUTH_URL == undefined ||
    process.env.OAUTO2_CLIENT_TOKEN_URL == undefined ||
    process.env.OAUTH2_CLIENT_ID == undefined ||
    process.env.OAUTH2_CLIENT_SECRET == undefined ||
    process.env.OAUTH2_CLIENT_CALLBACKURL == undefined
      ? (enabled = false)
      : (enabled = true);

    return enabled;
  }

  public static getAuthenticationScope(scope: string | undefined): string[] {
    if (!scope) {
      return [];
    }
    return scope.split(' ');
  }
}
