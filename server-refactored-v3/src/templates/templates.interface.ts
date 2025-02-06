import { IExtraVolume, ICronjob } from '../apps/apps.interface';
import { IKubectlMetadata } from '../kubernetes/kubernetes.interface';
import { ISecurityContext } from "../settings/settings.interface"
import { IAddon } from '../addons/addons.interface';

export interface ITemplate {
  name: string,
  deploymentstrategy: 'git' | 'docker',
  envVars: {}[],
  serviceAccount?: {
      annotations: {},
      create: boolean,
      name: string,
  },
  image : {
      repository: string,
      tag: string,
      pullPolicy?: 'Always',
      containerPort: number,
      run?: {
          repository: string,
          readOnlyAppStorage?: boolean,
          tag: string,
          readOnly?: boolean,
          securityContext: ISecurityContext
      }
  }

  web: {
      replicaCount: number
  }

  worker: {
      replicaCount: number
  }

  extraVolumes: IExtraVolume[],
  cronjobs: ICronjob[]
  addons: IAddon[]
}

export interface IKubectlTemplate
{
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata
  spec: ITemplate;
}