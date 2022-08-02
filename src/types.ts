import { IAddon } from './modules/addons';
export interface IApp {
    name: string,
    pipeline: string,
    phase: string,
    buildpack: string,
    gitrepo?: IGithubRepository,
    branch: string,
    autodeploy: boolean,
    domain?: string,
    podsize: IPodSize,
    autoscale: boolean,
    envVars: {}[],

    image : {
        repository: string,
        tag: string,
        pullPolicy: 'Always',
    }

    web: {
        replicaCount: number
        autoscaling: {
            minReplicas: number
            maxReplicas: number
            targetCPUUtilizationPercentage?: number
            targetMemoryUtilizationPercentage?: number
        }
    }

    worker: {
        replicaCount: number
        autoscaling: {
            minReplicas: number
            maxReplicas: number
            targetCPUUtilizationPercentage?: number
            targetMemoryUtilizationPercentage?: number
        }
    }

    cronjobs: ICronjob[]
    addons: IAddon[]
/*
    affinity: {},
    autoscaling: {
        enabled: boolean,
        maxReplicas: number,
        minReplicas: number,
        targetCPUUtilizationPercentage: number
    },
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
    resources: {},
/*
    service: {
        port: number,
        type: string
    },
    serviceAccount: {
        annotations: {},
        create: boolean,
        name: string,
    },
    tolerations: [],
*/
}

export interface ICronjob {
    name: string,
    schedule: string,
    command: [string],
    image: string,
    imagePullPolicy: string,
}


export interface IPipeline {
    name: string;
    //gitrepo: string;
    reviewapps: boolean;
    phases: IPipelinePhase[]; 
    buildpack: string;
    github: {
        repository?: IGithubRepository
        webhook: object;
    };
    dockerimage: string;
    deploymentstrategy: string;
}

export interface IGithubRepository {
    description?: string,
    id?: number,
    name?: string,
    node_id?: string,
    owner?: string,
    private?: boolean,
    ssh_url?: string
}

export interface IPipelinePhase {
    name: string;
    enabled: boolean;
    context: string;
    apps: IApp[];
}

// TODO replace with default kubeclt Interface
export interface IKubectlMetadata {
    creationTimestamp?: Date;
    generation?: number;
    //labels?: [Object];
    labels?: {
        'kubernetes.io/metadata.name'?: String,
        manager?: string;
    }
    managedFields?: [Array: Object]; 
    name?: String;
    namespace?: string;
    resourceVersion?: string;
    uid?: string;
}
export interface IKubectlPipeline {
    apiVersion: string;
    kind: string;
    metadata: IKubectlMetadata,
    spec: IPipeline
}
export interface IKubectlPipelineList {
    apiVersion: string;
    kind: string;
    metadata: IKubectlMetadata,
    items: IKubectlPipeline[]
}

export interface IKubectlApp
{
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata
  spec: IApp
}

export interface IKubectlAppList {
    apiVersion: string;
    items: IKubectlApp [];
    kind: string;
    metadata: { continue:  string; resourceVersion: string; }
}

export interface IPodSize {
    name: string;
    description: string,
    default?: boolean,
    active?: boolean,
    resources: {
      requests?: {
        memory: string,
        cpu: string
      },
      limits?: {
        memory: string,
        cpu: string
      }
    }
}

interface IBuildpack {
    name: string;
    repository: string;
    tag: string;
}
export interface IKuberoConfig {
    name: string;
    version: string;
    podSizeList: IPodSize[];
    buildpacks: IBuildpack[];
}