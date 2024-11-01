import { IAddon } from './modules/addons';
export interface IApp {
    name: string,
    pipeline: string,
    phase: string,
    sleep: string,
    buildpack: string,
    deploymentstrategy: 'git' | 'docker',
    buildstrategy: 'plain' | 'dockerfile' | 'nixpacks' | 'buildpacks',
    gitrepo?: IGithubRepository,
    branch: string,
    autodeploy: boolean,
    podsize: IPodSize,
    autoscale: boolean,
    envVars: {}[],
    image : {
        repository: string,
        tag: string,
        command: [string],
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
            readOnlyAppStorage?: boolean,
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
    ingress: {
        annotations: Object,
        className: string,
        enabled: boolean,
        hosts: [
            {
                host: string
                paths: [
                    {path: string, pathType: string}
                ]
            }
        ],
        tls: [
            {
                hosts: string[],
                secretName: string
            }
        ] | []
    },
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
    resources: {},
/*
    service: {
        port: number,
        type: string
    },
    */
    serviceAccount: {
        annotations: {},
        create: boolean,
        name: string,
    },
    //tolerations: [],
}



export interface ITemplate {
    name: string,
    deploymentstrategy: 'git' | 'docker',
    envVars: {}[],
    serviceAccount: {
        annotations: {},
        create: boolean,
        name: string,
    },
    image : {
        repository: string,
        tag: string,
        pullPolicy?: 'Always',
        containerPort: number,
        run: {
            repository: string,
            readOnlyAppStorage?: boolean,
            tag: string,
            readOnly?: boolean,
            securityContext: ISecurityContext
        }
    }

    web: {
        replicaCount: number
    }

    worker: {
        replicaCount: number
    }

    extraVolumes: IExtraVolume[],
    cronjobs: ICronjob[]
    addons: IAddon[]
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
    registry: IRegistry;
    dockerimage: string;
    deploymentstrategy: 'git' | 'docker',
    buildstrategy: 'plain' | 'dockerfile' | 'nixpacks' | 'buildpacks',
    resourceVersion?: string; // required to update resource, not part of spec
}

export interface IRegistry {
    host: string;
    username: string;
    password: string;
}

export interface IgitLink {
    keys: {
        priv?: string,
        pub?: string,
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
    finalizers?: [Array: Object];
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
  spec: IApp ;
}
export interface IKubectlTemplate
{
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata
  spec: ITemplate;
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
        readOnlyAppStorage: boolean;
        securityContext: ISecurityContext
    },
    build: {
        repository: string;
        tag: string;
        readOnlyAppStorage: boolean;
        securityContext: ISecurityContext
    },
    run: {
        repository: string;
        tag: string;
        readOnlyAppStorage: boolean;
        securityContext: ISecurityContext
    },
    tag: string;
}

export interface INotificationSlack {
    url: string;
    channel: string;
}

export interface INotificationWebhook {
    url: string;
    secret: string;
}

export interface INotificationDiscord {
    url: string;
}

export interface INotification {
    action: string;
    user: string;
    severity: string;
    namespace: string;
    phase: string;
    app: string;
    pipeline: string;
    resource: string;
    message: string;
}

export interface INotificationConfig{
    enabled: boolean;
    name: string;
    type: 'slack' | 'webhook' | 'discord',
    pipelines: string[],
    events: string[],
    config: INotificationSlack | INotificationWebhook | INotificationDiscord;
}

export interface IKuberoConfig {
    podSizeList: IPodSize[];
    buildpacks: IBuildpack[];
    clusterissuer: string;
    notifications: INotificationConfig[];
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
        console: {
            enabled: boolean;
        }
        admin: {
            disabled: boolean;
        }
        readonly: boolean;
        banner: {
            message: string;
            bgcolor: string;
            fontcolor: string;
            show: boolean;
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

export interface ILoglines {
    id: string,
    time: number,
    pipeline: string,
    phase: string,
    app: string,
    pod: string,
    podID: string,
    container: string,
    color: string,
    log: string,
}

export interface IMessage {
    action: string,
    text?: string,
    appName?: string,
    pipelineName?: string,
    phaseName?: string,
    data?: any
}

export interface Uptime {
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number
}

export interface Workload {
        name: string,
        namespace: string,
        phase: string,
        pipeline: string,
        status: string,
        restarts: number,
        age: Date | undefined,
        startTime: Date | undefined,
        containers: WorkloadContainer[]
}

export interface WorkloadContainer {
    name: string,
    image: string,
    restartCount?: number,
    ready?: boolean,
    started?: boolean,
    age: Date | undefined,
}
