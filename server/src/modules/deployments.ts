import { Kubectl } from './kubectl';
import { User } from './auth';
import { Notifications, INotification } from './notifications';
import { Kubero } from '../kubero';
import { IKubectlApp, ILoglines } from '../types';


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
      app: string,
      id: string,
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
        tag: string,
        active?: boolean
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
    jobstatus?: {
      duration?: number // in miliseconds
      startTime: string
      completionTime?: string
      status: "Unknown" | "Active" | "Succeeded" | "Failed"
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
    kubero: Kubero;
}

export class Deployments {
    private kubectl: Kubectl;
    private _io: any;
    private notification: Notifications;
    private kubero: Kubero;

    constructor(
        options: DeploymentOptions
    ) {
        this.kubectl = options.kubectl
        this._io = options.io
        this.notification = options.notifications
        this.kubero = options.kubero
    }

    public async getDeployments(pipelineName: string, phaseName: string, appName: string): Promise<any> {
        const namespace = pipelineName + "-" + phaseName
        const deployments =  await this.kubectl.getKuberoBuilds(namespace) as KuberoBuildList
        const appresult = await this.kubero.getApp(pipelineName, phaseName, appName)

        const app = appresult?.body as IKubectlApp;

        if (!deployments) {
            console.log('No deployments found')
            return {
                items: []
            }
        }

        for (const deployment of deployments.items) {
            //remove useless fields
            delete deployment.metadata.managedFields
            delete deployment.status?.deployedRelease


            if (deployment.spec.repository.image === app.spec.image.repository && deployment.spec.repository.tag === app.spec.image.tag) {
              deployment.spec.repository.active = true
            } else {
              deployment.spec.repository.active = false
            }

            // remove depployment if name does not match app
            if (deployment.spec.app !== appName) {
                const index = deployments.items.indexOf(deployment)
                deployments.items.splice(index, 1)
            } else {
              // load jobn details
              const job = await this.kubectl.getJob(namespace, `${deployment.spec.app}-${deployment.spec.pipeline}-${deployment.spec.id}`) //TODO: Naming might change, since it is the wrong order
              if (job) {
                /*
[1]   status: V1JobStatus {
[1]     active: undefined,
[1]     completedIndexes: undefined,
[1]     completionTime: 2024-07-12T20:05:05.000Z,
[1]     conditions: [ [V1JobCondition] ],
[1]     failed: 1,
[1]     failedIndexes: undefined,
[1]     ready: 0,
[1]     startTime: 2024-07-12T20:02:53.000Z,
[1]     succeeded: 1,
[1]     terminating: 0,
[1]     uncountedTerminatedPods: V1UncountedTerminatedPods {
[1]       failed: undefined,
[1]       succeeded: undefined
[1]     }
[1]   }
[1] }

[1]   status: V1JobStatus {
[1]     active: 1,
[1]     completedIndexes: undefined,
[1]     completionTime: undefined,
[1]     conditions: undefined,
[1]     failed: 1,
[1]     failedIndexes: undefined,
[1]     ready: 0,
[1]     startTime: 2024-07-13T12:21:27.000Z,
[1]     succeeded: undefined,
[1]     terminating: 0,
[1]     uncountedTerminatedPods: V1UncountedTerminatedPods {
[1]       failed: undefined,
[1]       succeeded: undefined
[1]     }
[1]   }
[1] }

[1]   status: V1JobStatus {
[1]     active: undefined,
[1]     completedIndexes: undefined,
[1]     completionTime: undefined,
[1]     conditions: [ [V1JobCondition] ],
[1]     failed: 2,
[1]     failedIndexes: undefined,
[1]     ready: 0,
[1]     startTime: 2024-07-13T12:21:27.000Z,
[1]     succeeded: undefined,
[1]     terminating: 0,
[1]     uncountedTerminatedPods: V1UncountedTerminatedPods {
[1]       failed: undefined,
[1]       succeeded: undefined
[1]     }
[1]   }
[1] }

[1]   status: V1JobStatus {
[1]     active: 1,
[1]     completedIndexes: undefined,
[1]     completionTime: undefined,
[1]     conditions: undefined,
[1]     failed: undefined,
[1]     failedIndexes: undefined,
[1]     ready: 0,
[1]     startTime: 2024-07-13T12:21:27.000Z,
[1]     succeeded: undefined,
[1]     terminating: 0,
[1]     uncountedTerminatedPods: V1UncountedTerminatedPods {
[1]       failed: undefined,
[1]       succeeded: undefined
[1]     }
[1]   }
                */
                const duration = new Date(job.status.completionTime).getTime() - new Date(job.status.startTime).getTime()

                let status: "Unknown" | "Active" | "Succeeded" | "Failed" = 'Unknown'
                if (job.status.active) {
                  status = 'Active'
                } else if (job.status.succeeded) {
                  status = 'Succeeded'
                } else if (job.status.failed > 1) { //2 attempts allowed
                  status = 'Failed'
                }

                deployment.jobstatus = {
                  duration: duration,
                  startTime: job.status.startTime,
                  completionTime: job.status.completionTime,
                  status: status
                }
              }
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

    public async getBuildLogs(pipelineName: string, phaseName: string, appName: string, buildName: string): Promise<any> {
      const contextName = this.kubero.getContext(pipelineName, phaseName);
      const namespace = pipelineName+'-'+phaseName;

      let logs = {
        //buildstrategy: '' as string,
        deploy: [] as ILoglines[],
        push: [] as ILoglines[],
        build: [] as ILoglines[],
        fetch: [] as ILoglines[]
      } as any;

      if (contextName) {
          const pods = await this.kubectl.getPods(namespace, contextName);
          for (const pod of pods) {
              if (pod.metadata?.labels?.kuberoapp == appName && pod.metadata.name) {
                  //console.log('Fetching logs for pod: ', pod.metadata.name)
                  logs.deploy = await this.kubero.fetchLogs(namespace, pod.metadata.name, "deployer", pipelineName, phaseName, appName)
                  for (const container of pod.spec?.initContainers || []) {
                      //console.log('Fetching logs for initcontainer: ', container.name)
                      logs[container.name] = await this.kubero.fetchLogs(namespace, pod.metadata.name, container.name, pipelineName, phaseName, appName)
                  }
              }
          }
      }
      return logs;
  }
}