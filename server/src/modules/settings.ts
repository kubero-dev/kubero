import { Kubectl } from './kubectl';
import { IKuberoConfig, IMessage} from '../types';
import { KuberoConfig } from './config';
import YAML from 'yaml'
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Audit } from './audit';

export interface SettingsOptions {
    kubectl: Kubectl;
    config: IKuberoConfig;
    audit: Audit;
    io: any;
}

export class Settings {
    private kubectl: Kubectl;
    private runningConfig: IKuberoConfig
    private audit: Audit;
    private _io: any;
    constructor(
        options: SettingsOptions
    ) {
        this.kubectl = options.kubectl
        this.runningConfig = options.config
        this.audit = options.audit
        this._io = options.io
    }

    public async getSettings(): Promise<any> {

        if (this.checkAdminDisabled()) {
            return {
                admin: false
            }
        }

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

        // Backward compatibility older than v.2.1.0
        if ( !config.settings.kubero.config.kubero.admin ) {
            config.settings.kubero.config.kubero.admin = { disabled: false }
        }

        config["secrets"] = {
            GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '',
            GITEA_PERSONAL_ACCESS_TOKEN: process.env.GITEA_PERSONAL_ACCESS_TOKEN || '',
            GITEA_BASEURL: process.env.GITEA_BASEURL || '',
            GITLAB_PERSONAL_ACCESS_TOKEN: process.env.GITLAB_PERSONAL_ACCESS_TOKEN || '',
            GITLAB_BASEURL: process.env.GITLAB_BASEURL || '',
            BITBUCKET_APP_PASSWORD: process.env.BITBUCKET_APP_PASSWORD || '',
            BITBUCKET_USERNAME: process.env.BITBUCKET_USERNAME || '',
            GOGS_PERSONAL_ACCESS_TOKEN: process.env.GOGS_PERSONAL_ACCESS_TOKEN || '',
            GOGS_BASEURL: process.env.GOGS_BASEURL || '',
            KUBERO_WEBHOOK_SECRET: process.env.KUBERO_WEBHOOK_SECRET || '',
            GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
            OAUTH2_CLIENT_SECRET: process.env.OAUTH2_CLIENT_SECRET || '',
        }
        //config["env"] = process.env
        return config
    }

    public async updateSettings(config: any): Promise<KuberoConfig> {

        if (this.checkAdminDisabled()) {
            return new KuberoConfig({} as IKuberoConfig)
        }

        const namespace = process.env.KUBERO_NAMESPACE || "kubero"
        let kuberoes = await this.kubectl.getKuberoConfig(namespace)
        kuberoes.spec = config.settings
  
        // Write local config file in dev mode
        if (process.env.NODE_ENV != "production") {
            console.log("DEV MODE: write local config")
            this.writeConfig(kuberoes.spec.kubero.config)
        }

        this.kubectl.updateKuberoConfig(namespace, kuberoes)
        this.kubectl.updateKuberoSecret(namespace, config.secrets)
        this.setEnv(config.secrets)

        this.audit?.log({
            user: 'kubero',
            severity: 'normal',
            action: 'update',
            namespace: '',
            phase: '',
            app: '',
            pipeline: '',
            resource: 'system',
            message: 'kubero settings updated',
        });
        const message = {
            'action': 'updated',
            'text': 'Kubero settings updated',
            'data': {}
        } as IMessage;
        this._io.emit('updatedKuberoSettings', message);


        return kuberoes
    }

    private setEnv(secrets: any) {
        /*
        for (const key in secrets) {
            process.env[key] = secrets[key]
        }
        */
        process.env.GITHUB_PERSONAL_ACCESS_TOKEN = secrets.GITHUB_PERSONAL_ACCESS_TOKEN
        process.env.GITEA_PERSONAL_ACCESS_TOKEN = secrets.GITEA_PERSONAL_ACCESS_TOKEN
        process.env.GITEA_BASEURL = secrets.GITEA_BASEURL
        process.env.GITLAB_PERSONAL_ACCESS_TOKEN = secrets.GITLAB_PERSONAL_ACCESS_TOKEN
        process.env.GITLAB_BASEURL = secrets.GITLAB_BASEURL
        process.env.BITBUCKET_APP_PASSWORD = secrets.BITBUCKET_APP_PASSWORD
        process.env.BITBUCKET_USERNAME = secrets.BITBUCKET_USERNAME
        process.env.GOGS_PERSONAL_ACCESS_TOKEN = secrets.GOGS_PERSONAL_ACCESS_TOKEN
        process.env.GOGS_BASEURL = secrets.GOGS_BASEURL
        process.env.KUBERO_WEBHOOK_SECRET = secrets.KUBERO_WEBHOOK_SECRET
        process.env.GITHUB_CLIENT_SECRET = secrets.GITHUB_CLIENT_SECRET
        process.env.OAUTH2_CLIENT_SECRET = secrets.OAUTH2_CLIENT_SECRET
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

    private checkAdminDisabled() {
        return this.runningConfig.kubero.admin?.disabled || false
    }
}