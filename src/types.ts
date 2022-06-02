export interface IApp {
    name: string;
    pipeline: string;
    phase: string;
    gitrepo: string;
    branch: string;
    autodeploy: boolean;
    domain?: string;
    podsize: string;
    webreplicas?: number;
    workerreplicas?: number;
}

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
    name?: string;
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
  metadata: {
    creationTimestamp?: string;
    generation?: number;
    //labels?: [Object];
    labels?: {
        manager?: string;
    }
    managedFields?: [Array: Object]; 
    name?: string;
    namespace?: string;
    resourceVersion?: string;
    uid?: string;
  },
  spec: IApp
}

export interface IKubectlAppList {
    apiVersion: string;
    items: IKubectlApp [];
    kind: string;
    metadata: { continue:  string; resourceVersion: string; }
}