import { Kubectl } from './kubectl';
/*
type Deployment = {
    name: string;
    namespace: string;
    phase: string;
    pipeline: string;
    app: string;
    status: string;
    replicas: number;
    ready: number;
    updated: number;
    available: number;
    age: string;
    container: string;
    image: string;
    ports: string;
    selector: string;
    labels: string;
    annotations: string;
    creationTimestamp: string;
}
*/

type KuberoBuild = {
    apiVersion: string
    kind: string
    metadata: {
      creationTimestamp: string
      finalizers: Array<string>
      generation: number
      managedFields?: Array<any>
      name: string
      namespace: string
      resourceVersion: string
      uid: string
    }
    spec: {
      app: string
      buildpack: {
        builder: string
        serviceAccount: string
      }
      buildstrategy: string
      dockerfile: {
        fetcher: string
        path: string
        pusher: string
      }
      git: {
        revision: string
        url: string
      }
      nixpack: {
        builder: string
        fetcher: string
        path: string
        pusher: string
      }
      pipeline: string
      podSecurityContext: {
        fsGroup: number
      }
      repository: {
        image: string
        tag: string
      }
    }
    status: {
      conditions: Array<{
        lastTransitionTime: string
        status: string
        type: string
        reason?: string
      }>
      deployedRelease?: {
        manifest: string
        name: string
      }
    }
  }


  export type KuberoBuildList = {
    apiVersion: string
    items: Array<KuberoBuild>
    kind: string
    metadata: {
      continue: string
      resourceVersion: string
    }
  }
  

export interface DeploymentOptions {
    kubectl: Kubectl;
}

export class Deployments {
    private kubectl: Kubectl;

    constructor(
        options: DeploymentOptions
    ) {
        this.kubectl = options.kubectl
    }

    public async getDeployments(pipeline: string, phase: string, app: string): Promise<any> {
        const namespace = pipeline + "-" + phase
        const deployments =  await this.kubectl.getKuberoBuilds(namespace) as KuberoBuildList

        //remove useless fields
        for (const deployment of deployments.items) {
            delete deployment.metadata.managedFields
            delete deployment.status.deployedRelease

            // remove depployment if name does not match app
            if (deployment.spec.app !== app) {
                const index = deployments.items.indexOf(deployment)
                deployments.items.splice(index, 1)
            }
        }

        return deployments
    }
}