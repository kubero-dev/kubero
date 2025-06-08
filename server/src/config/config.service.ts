import { Injectable, Logger } from '@nestjs/common';
import { IKuberoCRD, IKuberoConfig, IRegistry } from './config.interface';
import { KuberoConfig } from './kubero-config/kubero-config';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { readFileSync, writeFileSync } from 'fs';
import YAML from 'yaml';
import { join } from 'path';
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
    this.setKuberoUIVersion();
  }

  private setKuberoUIVersion() {
    if (process.env.npm_package_version == undefined) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.resolve(__dirname, '../VERSION');
      if (!fs.existsSync(filePath)) {
        process.env.npm_package_version = 'no version';
      } else {
        process.env.npm_package_version = fs.readFileSync(filePath, 'utf8');
      }
    }

    this.logger.debug('Kubero UI Version: ' + process.env.npm_package_version);
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
    this.setSecretEnv(config.secrets);

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

  private setSecretEnv(secrets: any) {
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

  private setEnvVar(key: string, value: string): void {
    if (process.env[key] == undefined || process.env[key] == '') {
      // Only set the environment variable if it is not already set or empty
      process.env[key] = value;
      //this.logger.warn(`DEPRECATED v3.x.0: Environment variable ${key} set to ${value}. Use configmap instead.`);
    }
  }

  private loadDeprecatedVarsToEnv(config: IKuberoConfig): void {
    // Update environment variables based on the config
    this.setEnvVar('KUBERO_READONLY', config.kubero?.readonly ? 'true' : 'false');
    this.setEnvVar('KUBERO_CONSOLE_ENABLED', config.kubero?.console?.enabled ? 'true' : 'false');
    this.setEnvVar('KUBERO_ADMIN_DISABLED', config.kubero?.admin?.disabled ? 'true' : 'false');
    this.setEnvVar('KUBERO_BANNER_SHOW', config.kubero?.banner?.show ? 'true' : 'false');
    this.setEnvVar('KUBERO_BANNER_MESSAGE', config.kubero?.banner?.message || 'Welcome to Kubero!');
    this.setEnvVar('KUBERO_BANNER_BGCOLOR', config.kubero?.banner?.bgcolor || '#8560a963');
    this.setEnvVar('KUBERO_BANNER_FONTCOLOR', config.kubero?.banner?.fontcolor || '#00000087');
    this.setEnvVar('KUBERO_TEMPLATES_ENABLED', config.templates?.enabled ? 'true' : 'false');
  }

  private reloadRunningConfig(): void {
    this.readConfig()
      .then((config) => {
        this.logger.debug('Kubero config loaded');
        this.runningConfig = config;
        this.loadDeprecatedVarsToEnv(config);
      })
      .catch((error) => {
        this.logger.error('Error reading kuberoes config');
        this.logger.error(error);
      });
  }

  private async readConfig(): Promise<IKuberoConfig> {
    if (process.env.NODE_ENV === 'production') {
      const kuberoCRD = await this.readConfigFromKubernetes();
      this.logger.debug('Kubero config loaded from Kubernetes');
      return kuberoCRD.kubero.config;
    } else {
      this.logger.debug('Kubero config loaded from filesystem (dev mode)');
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
    } catch (_error) {
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
    } catch (_error) {
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
    if (process.env.KUBERO_ADMIN_DISABLED === 'true') {
      this.logger.warn('Admin is disabled');
      return true;
    }
    return false;
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
    return process.env.KUBERO_TEMPLATES_ENABLED
  }

  public async getTemplateConfig() {
    return this.runningConfig.templates;
  }

  getConsoleEnabled(): boolean {
    if (process.env.KUBERO_CONSOLE_ENABLED == undefined) {
      this.logger.warn(
        'KUBERO_CONSOLE_ENABLED is not set, defaulting to false',
      );
      return false;
    }
    if (process.env.KUBERO_CONSOLE_ENABLED == 'true') {
      this.logger.debug('KUBERO_CONSOLE_ENABLED is set to true');
      return true;
    }
    this.logger.debug('KUBERO_CONSOLE_ENABLED is set to false');
    return false;
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
    } catch (_error) {
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

  public async getRunpacks(): Promise<Buildpack[]> {
    //return this.runningConfig.buildpacks || [];
    const buildpackList: Buildpack[] = [];

    const namespace = process.env.KUBERO_NAMESPACE || 'kubero';
    const kuberoes = await this.kubectl.getKuberoConfig(namespace);

    for (const buildpack of kuberoes.spec.kubero.config.buildpacks) {
      const b = new Buildpack(buildpack);
      buildpackList.push(b);
    }

    return buildpackList;
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

  public getKuberoUIVersion(): string {
    if (process.env.npm_package_version == undefined) {
      return '0.0.0';
    }
    return process.env.npm_package_version;
  }
}
