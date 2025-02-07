import { IGithubRepository } from "src/apps/apps.interface";
import { IBuildpack } from "src/settings/settings.interface";
import { IKubectlMetadata } from "../kubernetes/kubernetes.interface";

export interface IPipeline {
  name: string;
  domain: string;
  reviewapps: boolean;
  phases: IPipelinePhase[];
  buildpack: IBuildpack
  git: IgitLink;
  registry: IRegistry;
  dockerimage: string;
  deploymentstrategy: 'git' | 'docker',
  buildstrategy: 'plain' | 'dockerfile' | 'nixpacks' | 'buildpacks',
  resourceVersion?: string; // required to update resource, not part of spec
}

export interface IPipelineList {
  items: IPipeline[],
}

export interface IgitLink {
  keys: {
      priv?: string,
      pub?: string,
  },
  provider?: string,
  repository?: IGithubRepository
  webhook: object;
}

export interface IPipelinePhase {
  name: string;
  enabled: boolean;
  context: string;
  defaultEnvvars: {}[];
  domain: string;
  //apps: IApp[];
}

export interface IRegistry {
  host: string;
  username: string;
  password: string;
}

export interface IKubectlPipeline {
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata,
  spec: IPipeline
}
export interface IKubectlPipelineList {
  apiVersion: string;
  kind: string;
  metadata: IKubectlMetadata,
  items: IKubectlPipeline[]
}