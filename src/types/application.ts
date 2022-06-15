
import { IApp, IKubectlMetadata, IKubectlApp} from '../types';

export class KubectlApp implements IKubectlApp{
    apiVersion: string;
    kind: string;
    metadata: IKubectlMetadata;
    spec: IApp;
    
    constructor(name: string) {
        this.apiVersion = "application.kubero.dev/v1alpha1";
        this.kind = "KuberoApp";
        this.metadata = {
            name: name,
            labels: {
                manager: 'kubero',
            }
        }
        this.spec = {} as IApp; // TODO: create a real object to keep it tyope safe
    }
}

export class App implements IApp{
    public name: string;
    public pipeline: string;
    public phase: string;
    public gitrepo: string;
    public branch: string;
    public autodeploy: boolean;
    public domain?: string;
    public podsize: string;
    public webreplicas?: number;
    public workerreplicas?: number;

    private affinity: {};
    private autoscaling: {
        enabled: boolean,
        maxReplicas: 100,
        minReplicas: 1,
        targetCPUUtilizationPercentage: 80
    };
    private fullnameOverride: "";
    imageBuilder: {
        pullPolicy: 'IfNotPresent',
        repository: 'ghcr.io/kubero-dev/docker-images/node-builder',
        tag: 'main',
        securityContext: {
            readOnlyRootFilesystem: boolean
        },
    };
    imageWeb: {
        pullPolicy: 'IfNotPresent',
        repository: 'ghcr.io/kubero-dev/docker-images/node-web',
        tag: 'main',
        securityContext: {
            readOnlyRootFilesystem: boolean
        },
    };
    imagePullSecrets: [];
    ingress?: {
        annotations: {},
        className: "",
        enabled: true,
        hosts: [
            {
                host: string,
                paths: [
                    {path: '/', pathType: 'ImplementationSpecific'}
                ]
            }
        ],
        tls: [],
    };
    nameOverride: "";
    nodeSelector: {};
    podAnnotations: {};
    podSecurityContext: {};
    replicaCount: 1;
    resources: {};
    service: {
        port: 80,
        type: 'ClusterIP'
    };
    serviceAccount: {
        annotations: {},
        create: true,
        name: "",
    };
    tolerations: [];
    
    constructor(
        app: IApp
    ) {
        this.name = app.name
        this.pipeline = app.pipeline
        this.phase = app.phase
        this.gitrepo = app.gitrepo
        this.branch = app.branch
        this.autodeploy = app.autodeploy
        this.podsize = app.podsize
        this.domain = app.domain
        this.webreplicas = app.webreplicas
        this.workerreplicas = app.workerreplicas

        this.affinity = {};
        this.autoscaling = {
            enabled: false,
            maxReplicas: 100,
            minReplicas: 1,
            targetCPUUtilizationPercentage: 80
        }
        this.fullnameOverride = "",
        this.imageBuilder = {
            pullPolicy: 'IfNotPresent',
            repository: 'ghcr.io/kubero-dev/docker-images/node-builder',
            tag: 'main',
            securityContext: {
                readOnlyRootFilesystem: false
            }
        }
        this.imageWeb = {
            pullPolicy: 'IfNotPresent',
            repository: 'ghcr.io/kubero-dev/docker-images/node-web',
            tag: 'main',
            securityContext: {
                readOnlyRootFilesystem: true
            }
        },
        this.imagePullSecrets = []

        if (app.domain) {
            this.ingress= {
                annotations: {},
                className: "",
                enabled: true,
                hosts: [
                    {
                        host: app.domain,
                        paths: [
                            {path: '/', pathType: 'ImplementationSpecific'}
                        ]
                    }
                ],
                tls: [],
            }
        } 
        this.nameOverride= "",
        this.nodeSelector= {},
        this.podAnnotations= {},
        this.podSecurityContext= {},
        this.replicaCount= 1,
        this.resources= {},
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