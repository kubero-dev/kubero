import { IBuildpack , IPipeline, IPipelinePhase, IKubectlPipeline, IKubectlMetadata, IGithubRepository} from '../types';

export class Pipeline implements IPipeline {
    public name: string;
    //public gitrepo: string;
    public dockerimage: string;
    public reviewapps: boolean;
    public phases: IPipelinePhase[];
    public buildpack: IBuildpack;
    public deploymentstrategy: 'git' | 'docker';
    public github: {
        repository?: IGithubRepository | undefined;
        webhook: object;
    };

    constructor(
        pl: IPipeline,
    ) {
        this.name = pl.name;
        //this.gitrepo = gitrepo;
        this.reviewapps = pl.reviewapps;
        this.phases = pl.phases;
        this.buildpack = pl.buildpack;
        this.dockerimage = pl.dockerimage;
        this.github = pl.github;
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
