import { Kubectl } from './kubectl';
import { IKuberoConfig} from '../types';
import { KuberoConfig } from './config';
import YAML from 'yaml'
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { auth } from '../routes/addons';

export interface SettingsOptions {
    kubectl: Kubectl;
}

export class Settings {
    private kubectl: Kubectl;
    constructor(
        options: SettingsOptions
    ) {
        this.kubectl = options.kubectl
    }

    public async getSettings(): Promise<any> {
        const namespace = process.env.KUBERO_NAMESPACE || "kubero"
        let settings = await this.kubectl.getKuberoConfig(namespace)

        let configMap: KuberoConfig
        if (process.env.NODE_ENV === "production") {
            configMap = new KuberoConfig(settings.spec.kubero.config)
        } else {
            configMap = new KuberoConfig(this.readConfig())
        }
        let config: any = {}
        config.settings = settings.spec

        config["webhook"] = { 
            url: process.env.KUBERO_WEBHOOK_URL || "",
            secret: process.env.KUBERO_WEBHOOK_SECRET || ""
        }

/*
        config["podSizeList"] = configMap.podSizeList
        config["kubero"] = configMap.kubero
        config["buildpacks"] = configMap.buildpacks
        config["templates"] = configMap.templates
        config["auth"] = {
            github:{
                enabled: false,
                id: process.env.GITHUB_CLIENT_ID || "",
                secret: process.env.GITHUB_CLIENT_SECRET || "",
                callbackUrl: process.env.GITHUB_CLIENT_CALLBACKURL || "",
                org: process.env.GITHUB_CLIENT_ORG || "",
            },
            oauth2:{
                enabled: false,
                name: process.env.OAUTO2_CLIENT_NAME || "",
                id: process.env.OAUTH2_CLIENT_ID || "",
                authUrl: process.env.OAUTO2_CLIENT_AUTH_URL || "",
                tokenUrl: process.env.OAUTO2_CLIENT_TOKEN_URL || "",
                secret: process.env.OAUTH2_CLIENT_SECRET || "",
                callbackUrl: process.env.OAUTH2_CLIENT_CALLBACKURL || "",
                scopes: process.env.OAUTH2_CLIENT_SCOPE || "",
            }
        }
        if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
            config.auth.github.enabled = true
        }
        if (process.env.OAUTO2_CLIENT_NAME && process.env.OAUTH2_ID) {
            config.auth.oauth2.enabled = true
        }

        config["auditLogs"] = {
            enabled: false,
            storageClassName: "",
            accessModes: ["ReadWriteOnce"],
            size: "0.1Gi",
            limit: 1000
        }
*/
        config["repositoryProviders"] = { 
            github: {
                personalAccessToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '', 
            },
            gitea: {
                personalAccessToken: process.env.GITEA_PERSONAL_ACCESS_TOKEN || '',
                baseUrl: process.env.GITEA_BASEURL || ''
            },
            gitlab: {
                personalAccessToken: process.env.GITLAB_PERSONAL_ACCESS_TOKEN || '',
                baseUrl: process.env.GITLAB_BASEURL || ''
            },
            bitbucket: {
                personalAccessToken: process.env.BITBUCKET_PERSONAL_ACCESS_TOKEN || '',
                username: process.env.BITBUCKET_USERNAME || ''
            },
            gogs: {
                personalAccessToken: process.env.GOGS_PERSONAL_ACCESS_TOKEN || '',
                baseUrl: process.env.GOGS_BASEURL || ''
            }
        }
        //config["env"] = process.env
        return config
    }

    public async updateSettings(config: any): Promise<KuberoConfig> {
        const namespace = process.env.KUBERO_NAMESPACE || "kubero"
        let settings = await this.kubectl.getKuberoConfig(namespace)

        let configMap: KuberoConfig
        if (process.env.NODE_ENV === "production") {
            configMap = new KuberoConfig(settings.spec.kubero.config)
        } else {
            configMap = new KuberoConfig(this.readConfig())
        }
/*
        if (configMap) {
            configMap.podSizeList = config.podSizeList
            configMap.kubero = config.kubero
            configMap.buildpacks = config.buildpacks
            configMap.templates = config.templates
        } else {
            configMap = new KuberoConfig(config)
        }
*/

        if (process.env.NODE_ENV === "production") {
            const namespace = process.env.KUBERO_NAMESPACE || "kubero"
            this.kubectl.updateKuberoConfig(namespace, configMap)
        } else {
            this.writeConfig(configMap)
        }

        return configMap
    }

    // read config from local filesystem (dev mode)
    private readConfig(): IKuberoConfig {
        // read config from local filesystem (dev mode)
        //const path = join(__dirname, 'config.yaml')
        const path = process.env.KUBERO_CONFIG_PATH || join(__dirname, 'config.yaml')
        let settings = readFileSync( path, 'utf8')
        return YAML.parse(settings) as IKuberoConfig
    }
    
    // write config to local filesystem (dev mode)
    private writeConfig(configMap: KuberoConfig) {
        const path = process.env.KUBERO_CONFIG_PATH || join(__dirname, 'config.yaml')
        writeFileSync(path, YAML.stringify(configMap), {
            flag: 'w',
            encoding: 'utf8'
        });
    }

    public async getDomains(): Promise<any> {
        let allIngress = await this.kubectl.getAllIngress()
        let domains: string[] = []
        allIngress.forEach((ingress: any) => {
            ingress.spec.rules.forEach((rule: any) => {
                domains.push(rule.host)
            })
        })
        return domains
    }
}