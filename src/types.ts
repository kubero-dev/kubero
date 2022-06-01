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
}