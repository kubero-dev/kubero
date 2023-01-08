import { IApp, IKubectlMetadata, IKubectlApp, IGithubRepository, ICronjob, IPodSize, IExtraVolume} from '../types';
import { IAddon } from './addons';

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
            securityContext?: {
                readOnlyRootFilesystem?: boolean;
                allowPrivilegeEscalation?: boolean;
                capabilities?: {
                    drop?: string[];
                    add?: string[];
                }
            }
        }
        build: {
            repository: string,
            tag: string,
            securityContext?: {
                readOnlyRootFilesystem?: boolean;
                allowPrivilegeEscalation?: boolean;
                capabilities?: {
                    drop?: string[];
                    add?: string[];
                }
            }
        }
        run: {
            repository: string,
            tag: string,
            readOnly?: boolean,
            securityContext?: {
                readOnlyRootFilesystem?: boolean;
                allowPrivilegeEscalation?: boolean;
                capabilities?: {
                    drop?: string[];
                    add?: string[];
                }
            }
        }
    };

    private imagePullSecrets: [];
    private ingress?: {
        annotations: Object,
        className: string,
        enabled: true,
        hosts: [
            {
                host: string,
                paths: [
                    {path: string, pathType: string}
                ]
            }
        ],
        tls: [{hosts: [string], secretName: string}] | []
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
            repository: app.image.repository || 'busybox',
            tag: 'latest',
            fetch: app.image.fetch,
            build: app.image.build,
            run: app.image.run,
        }

        this.imagePullSecrets = []

        if (app.domain) {
            this.ingress= {
                annotations: {},
                className: process.env.KUBERNETES_INGRESS_CLASSNAME || "",
                enabled: true,
                hosts: [
                    {
                        host: app.domain,
                        paths: [
                            {path: "/" , pathType: 'ImplementationSpecific'}
                        ]
                    }
                ],
                tls: [],
            }
        }

        if (app.ssl && this.ingress && app.domain) {
            this.ingress.annotations = {
                "cert-manager.io/cluster-issuer": "letsencrypt-prod",
                "kubernetes.io/tls-acme": "true",
                /* some cool headers i might want to add later
                "kubernetes.io/ingress.class": process.env.KUBERNETES_INGRESS_CLASSNAME || "",
                "nginx.ingress.kubernetes.io/ssl-redirect": "true",
                "nginx.ingress.kubernetes.io/force-ssl-redirect": "true",
                "nginx.ingress.kubernetes.io/secure-backends": "true",
                "nginx.ingress.kubernetes.io/backend-protocol": "HTTPS",
                "nginx.ingress.kubernetes.io/ssl-passthrough": "true",
                "nginx.ingress.kubernetes.io/enable-cors": "true",
                "nginx.ingress.kubernetes.io/cors-allow-origin": "*",
                "nginx.ingress.kubernetes.io/cors-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
                "nginx.ingress.kubernetes.io/cors-allow-headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
                "nginx.ingress.kubernetes.io/cors-allow-credentials": "true",
                "nginx.ingress.kubernetes.io/configuration-snippet": "proxy_set_header X-Forwarded-Proto $scheme;",
                "nginx.ingress.kubernetes.io/proxy-body-size": "0",
                "nginx.ingress.kubernetes.io/proxy-read-timeout": "3600",
                "nginx.ingress.kubernetes.io/proxy-send-timeout": "3600",
                "nginx.ingress.kubernetes.io/proxy-connect-timeout": "3600",
                "nginx.ingress.kubernetes.io/proxy-buffer-size": "128k",
                "nginx.ingress.kubernetes.io/proxy-buffers": "4 256k",
                "nginx.ingress.kubernetes.io/proxy-buffering": "on",
                "nginx.ingress.kubernetes.io/proxy-request-buffering": "on",
                "nginx.ingress.kubernetes.io/proxy-http-version": "1.1",
                "nginx.ingress.kubernetes.io/proxy-ssl-verify": "off",
                "nginx.ingress.kubernetes.io/proxy-ssl-verify-depth": "1",
                "nginx.ingress.kubernetes.io/proxy-ssl-name": "localhost",
                "nginx.ingress.kubernetes.io/proxy-ssl-server-name": "on",
                "nginx.ingress.kubernetes.io/proxy-ssl-secret": "default/localhost-tls",
                */
            }
            this.ingress.tls = [
                {
                    hosts: [
                        app.domain
                    ],
                    secretName: app.name + '-tls'
                }
            ]
        }

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