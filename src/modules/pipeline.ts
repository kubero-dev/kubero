import { IBuildpack , IPipeline, IPipelinePhase, IKubectlPipeline, IKubectlMetadata, IGithubRepository} from '../types';

export class Pipeline implements IPipeline {
    public name: string;
    public domain: string;
    public dockerimage: string;
    public reviewapps: boolean;
    public phases: IPipelinePhase[];
    public buildpack: IBuildpack;
    public deploymentstrategy: 'git' | 'docker';
    public git: {
        keys: object,
        repository?: IGithubRepository | undefined;
        webhook: object;
    };

    constructor(
        pl: IPipeline,
    ) {
        this.name = pl.name;
        this.domain = pl.domain;
        this.reviewapps = pl.reviewapps;
        this.phases = pl.phases;
        this.buildpack = pl.buildpack;
        this.dockerimage = pl.dockerimage;
        this.git = pl.git;
        this.deploymentstrategy = pl.deploymentstrategy;
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
