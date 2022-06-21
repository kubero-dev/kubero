import { IPipeline, IPipelinePhase, IKubectlPipeline, IKubectlMetadata} from '../types';

export class Pipeline implements IPipeline {
    public name: string;
    public gitrepo: string;
    public reviewapps: boolean;
    public phases: IPipelinePhase[];
    public github: {
        repository: object;
        webhook: object;
    };

    constructor(name: string, gitrepo: string, reviewapps: boolean, phases: IPipelinePhase[]) {
        this.name = name;
        this.gitrepo = gitrepo;
        this.reviewapps = reviewapps;
        this.phases = phases;
        this.github = {
            repository: {},
            webhook: {},
        };
    }
}

export class KubectlPipeline implements IKubectlPipeline {
    public apiVersion: string;
    public kind: string;
    public metadata: IKubectlMetadata;
    public spec: IPipeline;

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
