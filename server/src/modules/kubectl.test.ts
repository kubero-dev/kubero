import { Kubectl } from './kubectl';
import YAML from 'yaml';
import * as fs from 'fs';
import { IKuberoConfig} from '../types';

describe('Kubectl', () => {
    it('should load config', () => {
/* FIX IT LATER 
        const path = process.env.KUBERO_CONFIG_PATH as string || './config.yaml';
        const config = YAML.parse(fs.readFileSync(path, 'utf8')) as IKuberoConfig;
        const kubectl = new Kubectl(config);

        expect(kubectl).toBeTruthy();
        expect(kubectl.config).toBeTruthy();
        expect(kubectl.log).toBeTruthy();

        expect(kubectl.getPipelinesList()).resolves.toBeDefined();

        expect(kubectl.getKubeVersion()).resolves.toBeDefined();
*/
    });
});