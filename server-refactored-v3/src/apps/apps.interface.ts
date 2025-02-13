import { IAddon } from '../addons/addons.interface';
import { IPodSize, ISecurityContext } from '../settings/settings.interface';
import { IKubectlMetadata } from '../kubernetes/kubernetes.interface';

export interface IApp {
  name: string;
  pipeline: string;
  phase: string;
  sleep: string;
  buildpack: string;
  deploymentstrategy: 'git' | 'docker';
  buildstrategy: 'plain' | 'dockerfile' | 'nixpacks' | 'buildpacks';
  gitrepo?: IGithubRepository;
  branch: string;
  autodeploy: boolean;
  podsize: IPodSize;
  autoscale: boolean;
  basicAuth: {
    enabled: boolean;
    realm: string;
    accounts: {
      user: string;
      pass: string;
      hash?: string;
    }[];
  };
  envVars: {}[];
  image: {
    repository: string;
    tag: string;
    command: [string];
    pullPolicy: 'Always';
    containerPort: number;
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
      readOnlyAppStorage?: boolean;
      tag: string;
      readOnly?: boolean;
      securityContext: ISecurityContext;
    };
  };

  web: {
    replicaCount: number;
    autoscaling: {
      minReplicas: number;
      maxReplicas: number;
      targetCPUUtilizationPercentage?: number;
      targetMemoryUtilizationPercentage?: number;
    };
  };

  worker: {
    replicaCount: number;
    autoscaling: {
      minReplicas: number;
      maxReplicas: number;
      targetCPUUtilizationPercentage?: number;
      targetMemoryUtilizationPercentage?: number;
    };
  };

  extraVolumes: IExtraVolume[];
  cronjobs: ICronjob[];
  addons: IAddon[];
  vulnerabilityscan: {
    enabled: boolean;
    schedule: string;
    image: {
      repository: string;
      tag: string;
    };
  };
  ingress: {
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
  /*
  affinity: {},
  fullnameOverride: string,
  imagePullSecrets: [],
  ingress?: {
      annotations: {},
      className: string,
      enabled: boolean,
      hosts: [
          {host: string}
      ],
      paths: [
          {path: string, pathType: string}
      ],
      tls: [],
  },
  nameOverride: string,
  nodeSelector: {},
  podAnnotations: {},
  podSecurityContext: {},
  replicaCount: number,
*/
  resources: {};
  /*
  service: {
      port: number,
      type: string
  },
  */
  serviceAccount: {
    annotations: {};
    create: boolean;
    name: string;
  };
  //tolerations: [],
  healthcheck: {
    enabled: boolean;
    path: string;
    startupSeconds: number;
    timeoutSeconds: number;
    periodSeconds: number;
  };
}

export interface IExtraVolume {
  name: string;
  mountPath: string;
  emptyDir: boolean;
  size: string;
  storageClass: string;
  accessModes: string[];
}

export interface IGithubRepository {
  admin: boolean;
  description?: string;
  id?: number;
  name?: string;
  node_id?: string;
  owner?: string;
  private?: boolean;
  ssh_url?: string;
  clone_url?: string;
}

export interface ICronjob {
  name: string;
  schedule: string;
  command: [string];
  image: string;
  imagePullPolicy: string;
}
