export interface IApp {
    name: string;
    phase: string;
    gitrepo: string;
    branch: string;
    reviewapps: boolean;
    domain?: string;
    podsize: string;
    webreplicas?: number;
    workerreplicas?: number;
}

export interface IPipeline {
    name: string;
    gitrepo: string; 
    reviewapps: boolean;
}