export interface IKuberoConfig {
    podSizeList: IPodSize[];
    buildpacks: IBuildpack[];
    clusterissuer: string;
    notifications: INotificationConfig[];
    templates: {
        enabled: boolean;
        catalogs: [
            {
                name: string;
                description: string;
                index: {
                    url: string;
                    format: string;
                }
            }
        ]
    }
    kubero: {
        console: {
            enabled: boolean;
        }
        admin: {
            disabled: boolean;
        }
        readonly: boolean;
        banner: {
            message: string;
            bgcolor: string;
            fontcolor: string;
            show: boolean;
        }
    }
}

interface INotificationConfig{
    enabled: boolean;
    name: string;
    type: 'slack' | 'webhook' | 'discord',
    pipelines: string[],
    events: string[],
    config: INotificationSlack | INotificationWebhook | INotificationDiscord;
}

interface INotificationSlack {
    url: string;
    channel: string;
}

interface INotificationWebhook {
    url: string;
    secret: string;
}

interface INotificationDiscord {
    url: string;
}

export interface IPodSize {
    name: string;
    description: string,
    default?: boolean,
    active?: boolean,
    resources: {
      requests?: {
        memory: string,
        cpu: string
      },
      limits?: {
        memory: string,
        cpu: string
      }
    }
}

export interface IBuildpack {
    name: string;
    language: string;
    fetch: {
        repository: string;
        tag: string;
        readOnlyAppStorage: boolean;
        securityContext: ISecurityContext
    },
    build: {
        repository: string;
        tag: string;
        readOnlyAppStorage: boolean;
        securityContext: ISecurityContext
    },
    run: {
        repository: string;
        tag: string;
        readOnlyAppStorage: boolean;
        securityContext: ISecurityContext
    },
    tag: string;
}

export interface ISecurityContext {
    readOnlyRootFilesystem: boolean;
    allowPrivilegeEscalation: boolean;
    runAsUser: number;
    runAsGroup: number;
    runAsNonRoot: boolean;
    capabilities: {
        drop: string[];
        add: string[];
    }
}