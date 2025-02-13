import { IApp } from 'src/apps/apps.interface';
import { IPipeline } from '../pipelines/pipelines.interface';
import { Template } from '../templates/template';

export interface IKubectlPipelineList {
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata,
  items: IKubectlPipeline[]
}

export interface IKubectlPipeline {
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata,
  spec: IPipeline
}

export interface IKubectlMetadata {
  creationTimestamp?: Date;
  generation?: number;
  //labels?: [Object];
  annotations?: Object;
  labels?: {
      'kubernetes.io/metadata.name'?: String,
      manager?: string;
  }
  managedFields?: [Array: Object];
  name?: String;
  namespace?: string;
  resourceVersion?: string;
  uid?: string;
  finalizers?: [Array: Object];
}

export interface IKubectlAppList {
  apiVersion: string;
  items: IKubectlApp [];
  kind: string;
  metadata: { continue:  string; resourceVersion: string; }
}

export interface IKubectlApp
{
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata
  spec: IApp ;
  status: {
    conditions: [Array: Object];
    deployedRelease?: {
      name: string;
      manifest: string;
    }
  }
}

export interface IStorageClass {
  name: string;
  provisioner: string;
  reclaimPolicy: string;
  volumeBindingMode: string;
  //allowVolumeExpansion: boolean;
  //mountOptions: string[];
}