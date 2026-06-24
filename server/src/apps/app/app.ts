import {
  IApp,
  IGithubRepository,
  ICronjob,
  IExtraVolume,
} from '../apps.interface';

import {
  IKubectlMetadata,
  IKubectlApp,
} from '../../kubernetes/kubernetes.interface';
import { IAddon } from '../../addons/addons.interface';
import { ISecurityContext, IPodSize } from '../../config/config.interface';
import { hashSync, genSaltSync } from 'bcrypt';
import { Buildpack } from '../../config/buildpack/buildpack';

export class KubectlApp implements IKubectlApp {
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata;
  spec: App;
  status: {
    conditions: [Array: object];
    deployedRelease?: { name: string; manifest: string };
  };

  constructor(app: App) {
    this.apiVersion = 'application.kubero.dev/v1alpha1';
    this.kind = 'KuberoApp';
    this.metadata = {
      name: app.name,
      labels: {
        manager: 'kubero',
      },
    };
    this.spec = app;
  }
}

export class App implements IApp {
  public name: string;
  public pipeline: string;
  public phase: string;
  public sleep: string;
  public buildpack: string;
  public deploymentstrategy: 'git' | 'docker';
  public buildstrategy: 'plain' | 'dockerfile' | 'nixpacks' | 'buildpacks';
  public gitrepo?: IGithubRepository;
  public branch: string;
  public autodeploy: boolean;
  public podsize: IPodSize;
  public autoscale: boolean;
  //public envVars: {[key: string]: string} = {}
  public basicAuth: {
    enabled: boolean;
    realm: string;
    accounts: {
      user: string;
      pass: string;
      hash?: string;
    }[];
  };
  public envVars: {}[] = [];
  public extraVolumes: IExtraVolume[] = [];
  public cronjobs: ICronjob[] = [];
  public addons: IAddon[] = [];

  public web: {
    replicaCount: number;
    autoscaling: {
      minReplicas: number;
      maxReplicas: number;
      targetCPUUtilizationPercentage?: number;
      targetMemoryUtilizationPercentage?: number;
    };
  };

  public worker: {
    replicaCount: number;
    autoscaling: {
      minReplicas: number;
      maxReplicas: number;
      targetCPUUtilizationPercentage?: number;
      targetMemoryUtilizationPercentage?: number;
    };
  };

  private affinity: {};
  private autoscaling: {
    enabled: boolean;
  };
  private fullnameOverride: '';

  public image: {
    containerPort: number;
    pullPolicy: 'Always';
    repository: string;
    tag: string;
    command: [string];
    fetch: {
      repository: string;
      tag: string;
      securityContext?: ISecurityContext;
    };
    build: {
      repository: string;
      tag: string;
      securityContext?: ISecurityContext;
    };
    run: {
      repository: string;
      tag: string;
      readOnlyAppStorage?: boolean;
      securityContext: ISecurityContext;
    };
  };

  public vulnerabilityscan: {
    enabled: boolean;
    schedule: string;
    image: {
      repository: string;
      tag: string;
    };
  };

  private imagePullSecrets: [];
  public ingress: {
    annotations: object;
    className: string;
    enabled: boolean;
    hosts: [
      {
        host: string;
        paths: [{ path: string; pathType: string }];
      },
    ];
    tls:
      | [
          {
            hosts: string[];
            secretName: string;
          },
        ]
      | [];
  };
  private nameOverride: '';
  private nodeSelector: {};
  private podAnnotations: {};
  private podSecurityContext: {};
  private replicaCount: 1;
  public resources: {};
  private service: {
    port: 80;
    type: 'ClusterIP';
  };
  public serviceAccount: {
    annotations: object;
    create: boolean;
    name: string;
  };
  private tolerations: [];

  public healthcheck: {
    enabled: boolean;
    path: string;
    startupSeconds: number;
    timeoutSeconds: number;
    periodSeconds: number;
  };

  constructor(app: IApp) {
    this.name = app.name;
    this.pipeline = app.pipeline;
    this.phase = app.phase;
    this.sleep = app.sleep;
    this.buildpack = app.buildpack;
    this.deploymentstrategy = app.deploymentstrategy;
    this.buildstrategy = app.buildstrategy;
    this.gitrepo = app.gitrepo;
    this.branch = app.branch;
    this.autodeploy = app.autodeploy;
    this.podsize = app.podsize;
    this.autoscale = app.autoscale; // TODO: may be redundant with autoscaling.enabled

    const salt = genSaltSync(10);
    if (app.basicAuth !== undefined) {
      this.basicAuth = {
        realm: app.basicAuth.realm,
        enabled: app.basicAuth.enabled,
        accounts: app.basicAuth.accounts.map((account) => {
          return {
            user: account.user,
            pass: account.pass,
            // generate hash with bcrypt from user and pass
            //hash: account.user+':$5$'+crypto.createHash('sha256').update(account.user+account.pass).digest('base64')
            //hash: account.user+':{SHA}'+crypto.createHash('sha1').update(account.pass).digest('base64') // works
            hash: account.user + ':' + hashSync(account.pass, salt),
          };
        }),
      };
    } else {
      this.basicAuth = {
        realm: 'Authenticate',
        enabled: false,
        accounts: [],
      };
    }

    this.envVars = app.envVars;

    this.serviceAccount = app.serviceAccount;

    this.extraVolumes = app.extraVolumes;

    this.cronjobs = app.cronjobs;

    this.addons = app.addons;

    this.web = app.web;
    this.worker = app.worker;

    this.affinity = {};
    this.autoscaling = {
      enabled: app.autoscale,
    };
    ((this.fullnameOverride = ''),
      (this.image = {
        containerPort: app.image.containerPort,
        pullPolicy: 'Always',
        repository: app.image.repository || 'ghcr.io/kubero-dev/idler',
        tag: app.image.tag || 'v1',
        command: app.image.command,
        fetch: app.image.fetch,
        build: app.image.build,
        run: app.image.run,
      }));

    // function to set security context, required for backwards compatibility
    // Added in v1.11.0
    this.image.fetch.securityContext = Buildpack.SetSecurityContext(
      this.image.fetch.securityContext,
    );
    this.image.build.securityContext = Buildpack.SetSecurityContext(
      this.image.build.securityContext,
    );
    this.image.run.securityContext = Buildpack.SetSecurityContext(
      this.image.run.securityContext,
    );

    this.vulnerabilityscan = app.vulnerabilityscan;

    this.imagePullSecrets = [];

    this.ingress = app.ingress;
    this.ingress.className =
      app.ingress.className ||
      process.env.KUBERNETES_INGRESS_CLASSNAME ||
      'nginx';
    this.ingress.enabled = true;

    ((this.nameOverride = ''),
      (this.nodeSelector = {}),
      (this.podAnnotations = {}),
      (this.podSecurityContext = {}),
      (this.replicaCount = 1),
      (this.resources = app.podsize.resources),
      (this.service = {
        port: 80,
        type: 'ClusterIP',
      }),
      (this.tolerations = []));

    this.healthcheck = app.healthcheck;
  }
}
