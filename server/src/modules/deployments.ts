import { Kubectl } from './kubectl';
import { User } from './auth';
import { Notifications, INotification } from './notifications';


export type KuberoBuild = {
    apiVersion: string
    kind: string
    metadata: {
      creationTimestamp?: string
      finalizers?: Array<string>
      generation?: number
      managedFields?: Array<any>
      name: string
      namespace: string
      resourceVersion?: string
      uid?: string
    }
    spec: {
      app: string
      buildpack?: {
        builder: string
        serviceAccount: string
      }
      buildstrategy: string
      dockerfile?: {
        fetcher: string
        path: string
        pusher: string
      }
      git: {
        revision?: string //TODO: Remove
        ref?: string
        url: string
      }
      nixpack?: {
        builder: string
        fetcher: string
        path: string
        pusher: string
      }
      pipeline: string
      podSecurityContext?: {
        fsGroup: number
      }
      repository: {
        image: string
        tag: string
      }
    }
    status?: {
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
    notifications: Notifications;
    io: any;
}

export class Deployments {
    private kubectl: Kubectl;
    private _io: any;
    private notification: Notifications;

    constructor(
        options: DeploymentOptions
    ) {
        this.kubectl = options.kubectl
        this._io = options.io
        this.notification = options.notifications
    }

    public async getDeployments(pipeline: string, phase: string, app: string): Promise<any> {
        const namespace = pipeline + "-" + phase
        const deployments =  await this.kubectl.getKuberoBuilds(namespace) as KuberoBuildList

        //remove useless fields
        for (const deployment of deployments.items) {
            delete deployment.metadata.managedFields
            delete deployment.status?.deployedRelease

            // remove depployment if name does not match app
            if (deployment.spec.app !== app) {
                const index = deployments.items.indexOf(deployment)
                deployments.items.splice(index, 1)
            }
        }

        return deployments
    }

    public async buildImage(
            pipeline: string, 
            phase: string, 
            app: string, 
            buildstrategy: 'buildpacks' | 'dockerfile' | 'nixpacks' | 'plain',
            gitrepo: string, 
            reference: string, 
            dockerfilePath: string,
            user: User
        ): Promise<any> {
        const namespace = pipeline + "-" + phase
        
        if ( process.env.KUBERO_READONLY == 'true'){
            console.log('KUBERO_READONLY is set to true');
            return;
        }

        // Create the Pipeline CRD
        try {
            //await this.kubectl.createKuberoBuild(namespace, kuberoBuild)
            await this.kubectl.createBuild(
                namespace,
                app,
                pipeline,
                buildstrategy,
                dockerfilePath,
                {
                    ref: reference,
                    url: gitrepo
                },
                {
                    image: process.env.KUBERO_BUILD_REGISTRY + "/" + pipeline + "/" + app,
                    tag: reference
                }
            )
        } catch (error) {
            console.log('Error creating KuberoBuild')
        }
        
        const m = {
            'name': 'newBuild',
            'user': user.username,
            'resource': 'pipeline',
            'action': 'created',
            'severity': 'normal',
            'message': 'Created new Build: '+app + ' in pipeline: '+pipeline,
            'pipelineName':pipeline,
            'phaseName': '',
            'appName': '',
            'data': {
                'pipeline': pipeline
            }
        } as INotification;
        this.notification.send(m, this._io);

        return {
            message: 'Build started'
        }
    }

    public async deleteDeployment(pipeline: string, phase: string, app: string, buildName: string, user: User): Promise<any> {
        const namespace = pipeline + "-" + phase
        await this.kubectl.deleteKuberoBuild(namespace, buildName)
        
        const m = {
          'name': 'newBuild',
          'user': user.username,
          'resource': 'build',
          'action': 'created',
          'severity': 'normal',
          'message': 'Created new Build: '+app + ' in pipeline: '+pipeline,
          'pipelineName':pipeline,
          'phaseName': '',
          'appName': '',
          'data': {
              'pipeline': pipeline
          }
      } as INotification;
      this.notification.send(m, this._io);

        return {
            message: 'Deployment deleted'
        }
    }
}