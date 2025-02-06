import { 
  IPipeline, 
  IPipelinePhase,
  IgitLink,
  IKubectlPipeline,
  IRegistry
} from '../pipelines.interface';

import { IBuildpack } from '../../settings/settings.interface';
import { IKubectlMetadata } from '../../kubernetes/kubernetes.interface';


export class Pipeline implements IPipeline {
    public name: string;
    public domain: string;
    public dockerimage: string;
    public reviewapps: boolean;
    public phases: IPipelinePhase[];
    public buildpack: IBuildpack;
    public deploymentstrategy: 'git' | 'docker';
    public buildstrategy : 'plain' | 'dockerfile' | 'nixpacks' | 'buildpacks';
    public git: IgitLink;
    public registry: IRegistry;

    constructor(
        pl: IPipeline,
    ) {
        this.name = pl.name;
        this.domain = pl.domain;
        this.reviewapps = pl.reviewapps;
        this.phases = pl.phases;
        this.buildpack = pl.buildpack;
        this.dockerimage = pl.dockerimage;
        this.deploymentstrategy = pl.deploymentstrategy;
        this.buildstrategy = pl.buildstrategy;
        this.git = pl.git;
        this.registry = pl.registry;
    }
}

export class KubectlPipeline implements IKubectlPipeline {
    public apiVersion: string;
    public kind: string;
    public metadata: IKubectlMetadata;
    public spec: Pipeline;

    constructor(pipeline: IPipeline) {
        this.apiVersion = "application.kubero.dev/v1alpha1";
        this.kind = "KuberoPipeline";
        this.metadata = {
            name: pipeline.name,
            labels: {
                manager: 'kubero',
            },
        };
        this.spec = pipeline;
    }
}
