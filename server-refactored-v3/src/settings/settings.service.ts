import { Injectable } from '@nestjs/common';
import { IKuberoConfig } from './settings.interface';

@Injectable()
export class SettingsService {
    async getSettings(): Promise<IKuberoConfig> {
        // Load settings from a file or from kubernetes

        let kc: IKuberoConfig = new Object() as IKuberoConfig;


        // Check if Kubero Administation is disabled

        return kc;
    }
    
}
