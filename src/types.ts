export interface IApp {
    name: string,
    pipeline: string,
    phase: string,
    gitrepo: string,
    branch: string,
    autodeploy: boolean,
    domain?: string,
    podsize: string,
    autoscale: boolean,
    webreplicas?: number,
    workerreplicas?: number,
    webreplicasrange?: [number, number],
    workerreplicasrange?: [number, number],
/*
    affinity: {},
    autoscaling: {
        enabled: boolean,
        maxReplicas: number,
        minReplicas: number,
        targetCPUUtilizationPercentage: number
    },
    fullnameOverride: string,
    imageBuilder: {
        pullPolicy: string,
        repository: string,
        tag: string,
        securityContext?: string,
        readOnlyRootFilesystem: boolean
    },
    imageWeb: {
        pullPolicy: string,
        repository: string,
        tag: string,
        securityContext: string,
        readOnlyRootFilesystem: boolean
    },
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
    resources: {},
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


export interface IPipeline {
    name: string;
    gitrepo: string;
    reviewapps: boolean;
    phases: IPipelinePhase[]; 
    github: {
        repository: object;
        webhook: object;
    };
}

export interface IPipelinePhase {
    name: string;
    enabled: boolean;
    apps: IApp[];
}

export interface IKubectlMetadata {
    creationTimestamp?: string;
    generation?: number;
    //labels?: [Object];
    labels?: {
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