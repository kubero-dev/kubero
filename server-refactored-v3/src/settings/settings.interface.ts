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

export type IKuberoCRD = {
    kubero: {
      debug: string
      namespace: string
      context: string
      webhook_url: string
      auth: {
        github: {
          enabled: boolean
          id: string
          callbackUrl: string
          org: string
        }
        oauth2: {
          enabled: boolean
          name: string
          id: string
          authUrl: string
          tokenUrl: string
          secret: string
          callbackUrl: string
          scope: string
        }
      }
      auditLogs: {
        enabled: boolean
        storageClassName: any
        accessModes: Array<string>
        size: string
        limit: number
      }
      config: IKuberoConfig
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

export type IRegistry = {
    account: {
      hash: string
      password: string
      username: string
    }
    create: boolean
    enabled: boolean
    host: string
    port: number
    storage: string
    storageClassName: any
    subpath: string
}
  