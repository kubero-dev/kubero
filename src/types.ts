import { IAddon } from './modules/addons';
export interface IApp {
    name: string,
    pipeline: string,
    phase: string,
    buildpack: string,
    deploymentstrategy: 'git' | 'docker',
    gitrepo?: IGithubRepository,
    branch: string,
    autodeploy: boolean,
    domain?: string,
    ssl?: boolean,
    podsize: IPodSize,
    autoscale: boolean,
    envVars: {}[],

    image : {
        repository: string,
        tag: string,
        pullPolicy: 'Always',
        containerPort: number,
        fetch: {
            repository: string,
            tag: string,
            securityContext?: {
                readOnlyRootFilesystem?: boolean;
                allowPrivilegeEscalation?: boolean;
                capabilities?: {
                    drop?: string[];
                    add?: string[];
                }
            }
        }
        build: {
            repository: string,
            tag: string,
            securityContext?: {
                readOnlyRootFilesystem?: boolean;
                allowPrivilegeEscalation?: boolean;
                capabilities?: {
                    drop?: string[];
                    add?: string[];
                }
            }
        }
        run: {
            repository: string,
            tag: string,
            readOnly?: boolean,
            securityContext?: {
                readOnlyRootFilesystem?: boolean;
                allowPrivilegeEscalation?: boolean;
                capabilities?: {
                    drop?: string[];
                    add?: string[];
                }
            }
        }
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
    domain: string;
    reviewapps: boolean;
    phases: IPipelinePhase[];
    buildpack: IBuildpack
    git: {
        keys: object,
        repository?: IGithubRepository
        webhook: object;
    };
    dockerimage: string;
    deploymentstrategy: 'git' | 'docker',
}

export interface IPipelineList {
    items: IPipeline[],
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

export interface IBuildpack {
    name: string;
    language: string;
    fetch: {
        repository: string;
        tag: string;
        securityContext?: {
            readOnlyRootFilesystem?: boolean;
            allowPrivilegeEscalation?: boolean;
            capabilities?: {
                drop?: string[];
            }
        }
    },
    build: {
        repository: string;
        tag: string;
        securityContext?: {
            readOnlyRootFilesystem?: boolean;
            allowPrivilegeEscalation?: boolean;
            capabilities?: {
                drop?: string[];
            }
        }
    },
    run: {
        repository: string;
        tag: string;
        securityContext?: {
            readOnlyRootFilesystem?: boolean;
            allowPrivilegeEscalation?: boolean;
            capabilities?: {
                drop?: string[];
            }
        }
    }
    tag: string;
}
export interface IKuberoConfig {
    name: string;
    version: string;
    podSizeList: IPodSize[];
    namespace: string;
    port: number;
    buildpacks: IBuildpack[];
}

export interface IDeployKeyPair {
    fingerprint: string;
    pubKey: string;
    pubKeyBase64: string;
    privKey: string;
    privKeyBase64: string;
}