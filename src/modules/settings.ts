import { Kubectl } from './kubectl';
import { IKuberoConfig } from '../types';
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
            const configMap = YAML.parse(settings.data["config.yaml"]) as IKuberoConfig
            config["podSizeList"] = configMap.podSizeList
            config["buildpacks"] = configMap.buildpacks
            config["templates"] = configMap.templates
        }

        // TODO: not sure if it is a good idea to expose the whole env to the frontend
        config["env"] = process.env
        return config
    }

}