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
    serviceAccount: {
        annotations: {},
        create: boolean,
        name: string,
    },
    tolerations: [],
*/
}


export interface ITemplate {
    name: string,
    deploymentstrategy: 'git' | 'docker',
    envVars: {}[],
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
    dockerimage: string;
    deploymentstrategy: 'git' | 'docker',
    resourceVersion?: string; // required to update resource, not part of spec
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
export interface IKuberoConfig {
    podSizeList: IPodSize[];
    buildpacks: IBuildpack[];
    clusterissuer: string;
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
        readonly: boolean;
        banner: {
            message: string;
            bgcolor: string;
            fontcolor: string;
        }
    }
}


export class KuberoConfig {
    public podSizeList: IPodSize[];
    public buildpacks: IBuildpack[];
    public clusterissuer: string;
    public templates: {  // introduced v1.11.0
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
    public kubero: {
        namespace?: string; // deprecated v1.9.0
        console: {
            enabled: boolean;
        }
        readonly: boolean;
        banner: {
            message: string;
            bgcolor: string;
            fontcolor: string;
        }
    }

    constructor(kc: IKuberoConfig) {

        const defaultbuildpack = {
            readOnlyRootFilesystem: false, 
            allowPrivilegeEscalation: false, 
            runAsUser: 1000, 
            runAsGroup: 1000, 
            runAsNonRoot: false, 
            capabilities: {
                drop: [], 
                add: []
            }
        };

        this.podSizeList = kc.podSizeList;
        this.buildpacks = kc.buildpacks;
        this.clusterissuer = kc.clusterissuer;
        this.templates = kc.templates;
        this.kubero = kc.kubero;

        for (let i = 0; i < this.buildpacks.length; i++) {

            this.buildpacks[i].fetch.readOnlyAppStorage = kc.buildpacks[i].fetch.readOnlyAppStorage || false;
            this.buildpacks[i].build.readOnlyAppStorage = kc.buildpacks[i].build.readOnlyAppStorage || false;
            this.buildpacks[i].run.readOnlyAppStorage = kc.buildpacks[i].run.readOnlyAppStorage || false;

            this.buildpacks[i].fetch.securityContext =  this.getSecurityContext(kc.buildpacks[i].fetch.securityContext);
            this.buildpacks[i].build.securityContext =  this.getSecurityContext(kc.buildpacks[i].build.securityContext);
            this.buildpacks[i].run.securityContext =  this.getSecurityContext(kc.buildpacks[i].run.securityContext);
        }
    }

    private getSecurityContext (sc: any) {
        let securityContext = {
            readOnlyRootFilesystem: sc.readOnlyRootFilesystem || false,
            allowPrivilegeEscalation: sc.allowPrivilegeEscalation || false,
            runAsUser: sc.runAsUser || 1000,
            runAsGroup: sc.runAsGroup || 1000,
            runAsNonRoot: sc.runAsNonRoot || false,
            capabilities: {
                drop: sc.capabilities?.drop || [],
                add: sc.capabilities?.add || []
            }
        }
        return securityContext
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
    appName?: string,
    pipelineName: string,
    phaseName: string,
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

