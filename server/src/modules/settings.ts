import { Kubectl } from './kubectl';
import { IKuberoConfig, KuberoConfig} from '../types';
import YAML from 'yaml'

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
        let settings = await this.kubectl.getKuberoconfig()
        let config: any = {}

        if (settings && settings.data) {
            const IkuberoConfig = YAML.parse(settings.data["config.yaml"]) as IKuberoConfig
            const configMap = new KuberoConfig(IkuberoConfig)
            config["podSizeList"] = configMap.podSizeList
            config["kubero"] = configMap.kubero
            config["buildpacks"] = configMap.buildpacks
            config["templates"] = configMap.templates
        }

        // TODO: not sure if it is a good idea to expose the whole env to the frontend
        config["env"] = process.env
        return config
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