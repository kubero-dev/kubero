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
        let deployments =  await this.kubectl.getKuberoBuilds(namespace) as KuberoBuildList
        const appresult = await this.kubero.getApp(pipelineName, phaseName, appName)

        const app = appresult?.body as IKubectlApp;

        if (!deployments) {
            console.log('No deployments found')
            return {
                items: []
            }
        }
        // revert order of deployments
        deployments.items = deployments.items.reverse()

        let retBuilds = [] as KuberoBuild[]
        for (let deployment of deployments.items) {

            // skip non matching apps
            if (deployment.spec.app != appName) {
                continue
            }

            //remove useless fields
            delete deployment.metadata.managedFields
            delete deployment.status?.deployedRelease

            if (deployment.spec.repository.image === app.spec.image.repository && deployment.spec.repository.tag === app.spec.image.tag) {
              deployment.spec.repository.active = true
            } else {
              deployment.spec.repository.active = false
            }

            // load job details
            const job = await this.kubectl.getJob(namespace, `${deployment.spec.app}-${deployment.spec.pipeline}-${deployment.spec.id}`)
            if (job) {
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

            retBuilds.push(deployment)
        }

        return retBuilds
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

    public async getBuildLogs(pipelineName: string, phaseName: string, appName: string, buildName: string, containerName: string): Promise<any> {
      const contextName = this.kubero.getContext(pipelineName, phaseName);
        const namespace = pipelineName+'-'+phaseName;

        let loglines = [] as ILoglines[];

        if (contextName) {
          const pods = await this.kubectl.getPods(namespace, contextName);
          for (const pod of pods) {
            //console.log('Fetching logs for pod: ', pod.metadata?.labels?.["job-name"], buildName)
            if (pod.metadata?.labels?.kuberoapp == appName && pod.metadata.name && pod.metadata?.labels?.["job-name"] == buildName) {
              const ll = await this.kubero.fetchLogs(namespace, pod.metadata.name, containerName, pipelineName, phaseName, appName)
              loglines = loglines.concat(ll);
            }
          }
        }
      return loglines;
  }
}