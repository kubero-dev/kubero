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

        let configMap: KuberoConfig
        if (process.env.NODE_ENV === "production") {
            configMap = await this.loadConfig()
        } else {
            configMap = new KuberoConfig(this.readConfig())
        }
        let config: any = {}
        config["podSizeList"] = configMap.podSizeList
        config["kubero"] = configMap.kubero
        config["buildpacks"] = configMap.buildpacks
        config["templates"] = configMap.templates

        // TODO: not sure if it is a good idea to expose the whole env to the frontend
        config["env"] = process.env
        return config
    }

    public async updateSettings(config: any): Promise<KuberoConfig> {

        let configMap: KuberoConfig
        if (process.env.NODE_ENV === "production") {
            configMap = await this.loadConfig()
        } else {
            configMap = new KuberoConfig(this.readConfig())
        }

        if (configMap) {
            configMap.podSizeList = config.podSizeList
            configMap.kubero = config.kubero
            configMap.buildpacks = config.buildpacks
            configMap.templates = config.templates
        } else {
            configMap = new KuberoConfig(config)
        }

        if (process.env.NODE_ENV === "production") {
            //this.kubectl.updateKuberoconfig(configMap)
            console.log("not implemented")
        } else {
            this.writeConfig(configMap)
        }

        return configMap
    }

    // load config from kubernetes cluster
    private async loadConfig(): Promise<KuberoConfig> {
        let settings = await this.kubectl.getKuberoconfig()
        
        if (settings && settings.data) {
            const IkuberoConfig = YAML.parse(settings.data["config.yaml"]) as IKuberoConfig
            const configMap = new KuberoConfig(IkuberoConfig)
            return configMap
        } else {
            return new KuberoConfig( {} as IKuberoConfig)
        }
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
        console.log("writeConfig")

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