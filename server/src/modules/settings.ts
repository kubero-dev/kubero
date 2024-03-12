import { Kubectl } from './kubectl';
import { IKuberoConfig} from '../types';
import { KuberoConfig } from './config';
import YAML from 'yaml'
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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
        let kuberoes = await this.kubectl.getKuberoConfig(namespace)
/*
        let configMap: KuberoConfig
        if (process.env.NODE_ENV === "production") {
            configMap = new KuberoConfig(kuberoes.spec.kubero.config)
        } else {
            configMap = new KuberoConfig(this.readConfig())
        }
*/
        let config: any = {}
        config.settings = kuberoes.spec

        config["webhook"] = { 
            url: process.env.KUBERO_WEBHOOK_URL || "",
            secret: process.env.KUBERO_WEBHOOK_SECRET || ""
        }
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
        let kuberoes = await this.kubectl.getKuberoConfig(namespace)
        kuberoes.spec = config.settings
  
        // Write local config file in dev mode
        if (process.env.NODE_ENV != "production") {
            console.log("DEV MODE: write local config")
            this.writeConfig(kuberoes.spec.kubero.config)
        }

        this.kubectl.updateKuberoConfig(namespace, kuberoes)
        //TODO: update configmap with secrets


        return kuberoes
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