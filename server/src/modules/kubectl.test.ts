import { Kubectl } from './kubectl';
import YAML from 'yaml';
import * as fs from 'fs';
import { IKuberoConfig} from '../types';

describe('Kubectl', () => {
    it('should load config', () => {
        const path = process.env.KUBERO_CONFIG_PATH as string || './config.yaml';
        const kubectl = new Kubectl();

        expect(kubectl).toBeTruthy();
        expect(kubectl.log).toBeTruthy();

        expect(kubectl.getPipelinesList()).resolves.toBeDefined();

        expect(kubectl.getKubeVersion()).resolves.toBeDefined();
    });
});