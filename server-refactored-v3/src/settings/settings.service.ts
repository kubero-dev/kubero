import { Injectable, Logger } from '@nestjs/common';
import { IKuberoConfig } from './settings.interface';
import { KuberoConfig } from './kubero-config/kubero-config';
import { Kubectl } from 'src/kubectl/kubectl';
import { readFileSync, writeFileSync } from 'fs';
import YAML from 'yaml'
import { join } from 'path';

@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);

    constructor() {
        console.log('SettingsService constructor')
        
    }

    // Load settings from a file or from kubernetes
    async getSettings(): Promise<KuberoConfig> {

        // TODO: Check if Kubero Administation is disabled

        let configMap: KuberoConfig
        if (process.env.NODE_ENV === "production") {
            configMap = new KuberoConfig(this.loadConfigFromKubernetes())
        } else {
            configMap = new KuberoConfig(this.readConfig())
        }

        return configMap;
    }

    private loadConfigFromKubernetes(): IKuberoConfig {
        // TODO: Load config from kubernetes
        return new Object() as IKuberoConfig
    }
    
    private readConfig(): IKuberoConfig {
        // read config from local filesystem (dev mode)
        //const path = join(__dirname, 'config.yaml')
        const path = process.env.KUBERO_CONFIG_PATH || join(__dirname, 'config.yaml')
        let settings: string
        try {
            settings = readFileSync( path, 'utf8')
            return YAML.parse(settings) as IKuberoConfig
        } catch (e) {
            this.logger.error('Error reading config file')
            
            return new Object() as IKuberoConfig
        }
    }
    
    // write config to local filesystem (dev mode)
    private writeConfig(configMap: KuberoConfig) {
        const path = process.env.KUBERO_CONFIG_PATH || join(__dirname, 'config.yaml')
        writeFileSync(path, YAML.stringify(configMap), {
            flag: 'w',
            encoding: 'utf8'
        });
    }

}
