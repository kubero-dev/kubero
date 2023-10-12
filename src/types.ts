import { IAddon } from './modules/addons';
export interface IApp {
    name: string,
    pipeline: string,
    phase: string,
    buildpack: string,
    deploymentstrategy: 'git' | 'docker',
    buildstrategy: 'plain' | 'dockerfile' | 'nixpacks',
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
            securityContext?: ISecurityContext
        }
        build: {
            repository: string,
            tag: string,
            securityContext?: ISecurityContext
        }
        run: {
            repository: string,
            tag: string,
            readOnly?: boolean,
            securityContext: ISecurityContext
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

    extraVolumes: IExtraVolume[],
    cronjobs: ICronjob[]
    addons: IAddon[]
    vulnerabilityscan: {
        enabled: boolean
        schedule: string
        image: {
            repository: string
            tag: string
        }
    }
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

export interface ISecurityContext {
    readOnlyRootFilesystem: boolean;
    allowPrivilegeEscalation: boolean;
    runAsUser: number;
    runAsGroup: number;
    runAsNonRoot: boolean;
    capabilities: {
        drop: string[];
        add: string[];
    }
}

export interface IExtraVolume {
    name: string,
    mountPath: string,
    emptyDir: boolean,
    size: string,
    storageClass: string,
    accessModes: string[],
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
    git: IgitLink;
    dockerimage: string;
    deploymentstrategy: 'git' | 'docker',
    resourceVersion?: string; // required to update resource, not part of spec
}

export interface IgitLink {
    keys: {
        priv: string,
        pub: string,
    },
    provider?: string,
    repository?: IGithubRepository
    webhook: object;
}

export interface IPipelineList {
    items: IPipeline[],
}

export interface IGithubRepository {
    admin: boolean,
    description?: string,
    id?: number,
    name?: string,
    node_id?: string,
    owner?: string,
    private?: boolean,
    ssh_url?: string
    clone_url?: string,
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
        securityContext: ISecurityContext
    },
    build: {
        repository: string;
        tag: string;
        securityContext: ISecurityContext
    },
    run: {
        repository: string;
        tag: string;
        securityContext: ISecurityContext
    },
    tag: string;
}
export interface IKuberoConfig {
    podSizeList: IPodSize[];
    buildpacks: IBuildpack[];
    templates: {  // introduced v1.11.0
        enabled: boolean;
        catalogs: [
            {
                name: string;
                description: string;
                templateBasePath: string;
                index: {
                    url: string;
                    format: string;
                }
            }
        ]
    }
    kubero: {
        namespace?: string; // deprecated v1.9.0
        readonly: boolean;
        banner: {
            message: string;
            bgcolor: string;
            fontcolor: string;
        }
    }
}

export interface IDeployKeyPair {
    fingerprint: string;
    pubKey: string;
    pubKeyBase64: string;
    privKey: string;
    privKeyBase64: string;
}