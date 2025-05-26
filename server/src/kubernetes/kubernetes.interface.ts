import { IApp } from 'src/apps/apps.interface';
import { IPipeline } from '../pipelines/pipelines.interface';

export interface IKubectlPipelineList {
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata;
  items: IKubectlPipeline[];
}

export interface IKubectlPipeline {
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata;
  spec: IPipeline;
}

export interface IKubectlMetadata {
  creationTimestamp?: Date;
  generation?: number;
  //labels?: [Object];
  annotations?: object;
  labels?: {
    'kubernetes.io/metadata.name'?: string;
    manager?: string;
  };
  managedFields?: [Array: object];
  name?: string;
  namespace?: string;
  resourceVersion?: string;
  uid?: string;
  finalizers?: [Array: object];
}

export interface IKubectlAppList {
  apiVersion: string;
  items: IKubectlApp[];
  kind: string;
  metadata: { continue: string; resourceVersion: string };
}

export interface IKubectlApp {
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata;
  spec: IApp;
  status: {
    conditions: [Array: object];
    deployedRelease?: {
      name: string;
      manifest: string;
    };
  };
}

export interface IStorageClass {
  name: string;
  provisioner: string;
  reclaimPolicy: string;
  volumeBindingMode: string;
  //allowVolumeExpansion: boolean;
  //mountOptions: string[];
}
