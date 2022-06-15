export interface IApp {
    name: string,
    pipeline: string,
    phase: string,
    gitrepo: string,
    branch: string,
    autodeploy: boolean,
    domain?: string,
    podsize: string,
    webreplicas?: number,
    workerreplicas?: number,
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

/*
export interface IKuberoApp{
    name: string;
    pipeline: string;
    phase: string;
    autodeploy: boolean;

    affinity: {},
    autoscaling: {
        enabled: boolean,
        maxReplicas: 100,
        minReplicas: 1,
        targetCPUUtilizationPercentage: 80
    },
    fullnameOverride: "",
    imageBuilder: {
        pullPolicy: 'IfNotPresent',
        repository: 'ghcr.io/kubero-dev/docker-images/node-builder',
        tag: 'main',
        securityContext?: string,
        readOnlyRootFilesystem: false
    },
    imageWeb: {
        pullPolicy: 'IfNotPresent',
        repository: 'ghcr.io/kubero-dev/docker-images/node-web',
        tag: 'main',
        securityContext: '',
        readOnlyRootFilesystem: true
    },
    imagePullSecrets: [],
    ingress: {
        annotations: {},
        className: "",
        enabled: true,
        hosts: [
            {host: 'kubero.lacolhost.com'} 
        ],
        paths: [
            {path: '/', pathType: 'ImplementationSpecific'}
        ],
        tls: [],
    },
    nameOverride: "",
    nodeSelector: {},
    podAnnotations: {},
    podSecurityContext: {},
    replicaCount: 1,
    resources: {},
    service: {
        port: 80,
        type: 'ClusterIP'
    },
    serviceAccount: {
        annotations: {},
        create: true,
        name: "",
    },
    tolerations: [],
}
*/

export interface IPipeline {
    name: string;
    reviewapps: boolean;
    phases: [Array: {name: string, enabled: boolean, apps: IApp[]}]; 
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