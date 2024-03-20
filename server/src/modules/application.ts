import { IApp, IKubectlMetadata, IKubectlApp, IKubectlTemplate, IGithubRepository, ICronjob, IPodSize, IExtraVolume, ISecurityContext, ITemplate} from '../types';
import { IAddon } from './addons';
import { Buildpack } from './config';

export class KubectlApp implements IKubectlApp{
    apiVersion: string;
    kind: string;
    metadata: IKubectlMetadata;
    spec: App;

    constructor(app: App) {
        this.apiVersion = "application.kubero.dev/v1alpha1";
        this.kind = "KuberoApp";
        this.metadata = {
            name: app.name,
            labels: {
                manager: 'kubero',
            }
        }
        this.spec = app;
    }
}

export class App implements IApp{
    public name: string
    public pipeline: string
    public phase: string
    public buildpack: string
    public deploymentstrategy: 'git' | 'docker';
    public buildstrategy: 'plain' | 'dockerfile' | 'nixpacks';
    public gitrepo?: IGithubRepository
    public branch: string
    public autodeploy: boolean
    public domain?: string
    public podsize: IPodSize
    public autoscale: boolean
    //public envVars: {[key: string]: string} = {}
    public envVars: {}[] = []
    public extraVolumes: IExtraVolume[] = []
    public cronjobs: ICronjob[] = []
    public addons: IAddon[] = []

    public web: {
        replicaCount: number
        autoscaling: {
            minReplicas: number
            maxReplicas: number
            targetCPUUtilizationPercentage?: number
            targetMemoryUtilizationPercentage?: number
        }
    }

    public worker: {
        replicaCount: number
        autoscaling: {
            minReplicas: number
            maxReplicas: number
            targetCPUUtilizationPercentage?: number
            targetMemoryUtilizationPercentage?: number
        }
    }

    private affinity: {};
    private autoscaling: {
        enabled: boolean,
    };
    private fullnameOverride: "";

    public image: {
        containerPort: number,
        pullPolicy: 'Always',
        repository: string,
        tag: string,
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
            tag: string,
            readOnlyAppStorage?: boolean,
            securityContext: ISecurityContext
        }
    };

    public vulnerabilityscan: {
        enabled: boolean
        schedule: string
        image: {
            repository: string
            tag: string
        }
    }

    private imagePullSecrets: [];
    public ingress: {
        annotations: Object,
        className: string,
        enabled: boolean,
        hosts: [
            {
                host: string,
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
    };
    private nameOverride: "";
    private nodeSelector: {};
    private podAnnotations: {};
    private podSecurityContext: {};
    private replicaCount: 1;
    public resources: {};
    private service: {
        port: 80,
        type: 'ClusterIP'
    };
    private serviceAccount: {
        annotations: {},
        create: true,
        name: "",
    };
    private tolerations: [];

    constructor(
        app: IApp
    ) {
        this.name = app.name
        this.pipeline = app.pipeline
        this.phase = app.phase
        this.buildpack = app.buildpack
        this.deploymentstrategy = app.deploymentstrategy
        this.buildstrategy = app.buildstrategy
        this.gitrepo = app.gitrepo
        this.branch = app.branch
        this.autodeploy = app.autodeploy
        this.podsize = app.podsize
        this.domain = app.domain
        this.autoscale = app.autoscale // TODO: may be redundant with autoscaling.enabled

        this.envVars =  app.envVars

        this.extraVolumes =  app.extraVolumes

        this.cronjobs = app.cronjobs

        this.addons = app.addons

        this.web =  app.web
        this.worker =  app.worker

        this.affinity = {};
        this.autoscaling = {
            enabled: app.autoscale
        }
        this.fullnameOverride = "",

        this.image = {
            containerPort: app.image.containerPort,
            pullPolicy: 'Always',
            repository: app.image.repository || 'ghcr.io/kubero-dev/idler',
            tag: app.image.tag || 'v1',
            fetch: app.image.fetch,
            build: app.image.build,
            run: app.image.run,
        }

        // function to set security context, required for backwards compatibility
        // Added in v1.11.0
        this.image.fetch.securityContext = Buildpack.SetSecurityContext(this.image.fetch.securityContext)
        this.image.build.securityContext = Buildpack.SetSecurityContext(this.image.build.securityContext)
        this.image.run.securityContext = Buildpack.SetSecurityContext(this.image.run.securityContext)

        this.vulnerabilityscan = app.vulnerabilityscan

        this.imagePullSecrets = []

        this.ingress = app.ingress
        this.ingress.className = app.ingress.className || process.env.KUBERNETES_INGRESS_CLASSNAME || "nginx"
        this.ingress.enabled = true
        this.ingress.hosts = [
            {
                host: app.domain || "",
                paths: [
                    {path: "/" , pathType: 'ImplementationSpecific'}
                ]
            }
        ]

        this.nameOverride= "",
        this.nodeSelector= {},
        this.podAnnotations= {},
        this.podSecurityContext= {},
        this.replicaCount= 1,
        this.resources= app.podsize.resources,
        this.service= {
            port: 80,
            type: 'ClusterIP'
        },
        this.serviceAccount= {
            annotations: {},
            create: true,
            name: "",
        },
        this.tolerations= []
    }
}

export class KubectlTemplate implements IKubectlTemplate{
    apiVersion: string;
    kind: string;
    metadata: IKubectlMetadata;
    spec: Template;

    constructor(app: IApp) {
        this.apiVersion = "application.kubero.dev/v1alpha1";
        this.kind = "KuberoApp";
        this.metadata = {
            name: app.name,
            labels: {
                manager: 'kubero',
            }
        }
        this.spec = new Template(app);
    }
}

export class Template implements ITemplate{
    public name: string
    public deploymentstrategy: 'git' | 'docker'
    public envVars: {}[] = []
    public extraVolumes: IExtraVolume[] = []
    public cronjobs: ICronjob[] = []
    public addons: IAddon[] = []

    public web: {
        replicaCount: number
    }

    public worker: {
        replicaCount: number
    }

    public image: {
        containerPort: number,
        pullPolicy?: 'Always',
        repository: string,
        tag: string,
        run: {
            repository: string,
            tag: string,
            readOnlyAppStorage?: boolean,
            securityContext: ISecurityContext
        }
    };
    constructor(
        app: IApp
    ) {
        this.name = app.name
        this.deploymentstrategy = app.deploymentstrategy

        this.envVars =  app.envVars

        this.extraVolumes =  app.extraVolumes

        this.cronjobs = app.cronjobs

        this.addons = app.addons

        this.web = {
            replicaCount: app.web.replicaCount
        }
        this.worker = {
            replicaCount: app.worker.replicaCount
        }

        this.image = {
            containerPort: app.image.containerPort,
            pullPolicy: 'Always',
            repository: app.image.repository || 'ghcr.io/kubero-dev/idler',
            tag: app.image.tag || 'v1',
            run: app.image.run,
        }

        // function to set security context, required for backwards compatibility
        // Added in v1.11.0
        this.image.run.securityContext = Buildpack.SetSecurityContext(this.image.run.securityContext)
    }
}
