import { Kubectl } from './kubectl';
import { User } from './auth';
import { Notifications, INotification } from './notifications';
import { Kubero } from '../kubero';
import { IKubectlApp, ILoglines } from '../types';
import YAML from 'yaml'
import { readFileSync } from 'fs';
import { join } from 'path';
import { V1Job, V1JobList } from '@kubernetes/client-node';

export function loadJob(jobname: string): V1Job {
  const path = join(__dirname, `./templates/${jobname}.yaml`)
  const job = readFileSync( path, 'utf8')
  return YAML.parse(job) as V1Job
}

type kuberoBuildjob = {
  creationTimestamp: string,
  name: string,
  app: string,
  pipeline: string,
  phase: string, //Missing
  image: string,
  tag: string,
  gitrepo: string,
  gitref: string,
  buildstrategy: string,

  backoffLimit: number,
  state: string,
  duration: number,
  status:  {
    completionTime?: string,
    conditions: Array<{
      lastProbeTime: string
      lastTransitionTime: string
      message: string
      reason: string
      status: string
      type: string
    }>
    failed?: number
    succeeded?: number
    active?: number
    ready: number
    startTime: string
    terminating: number
    uncountedTerminatedPods: any
  }
}

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
      pipeline: string
      id: string,
      buildstrategy: string
      buildpack?: {
        path: string
        cnbPlatformApi: string
      }
      dockerfile?: {
        path: string
      }
      nixpack?: {
        path: string
      }
      git: {
        revision?: string //TODO: Remove
        ref?: string
        url: string
      }
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

    public async listBuildjobs(pipelineName: string, phaseName: string, appName: string): Promise<any> {
        const namespace = pipelineName + "-" + phaseName
        let jobs =  await this.kubectl.getJobs(namespace) as V1JobList
        const appresult = await this.kubero.getApp(pipelineName, phaseName, appName)

        const app = appresult?.body as IKubectlApp;

        if (!jobs) {
            console.log('No deployments found')
            return {
                items: []
            }
        }

        let retJobs = [] as kuberoBuildjob[]
        for (let j of jobs.items as any) {

            // skip non matching apps
            if (j.metadata.labels.kuberoapp != appName) {
                continue
            }

            const retJob = {} as kuberoBuildjob
            retJob.creationTimestamp = j.metadata.creationTimestamp
            retJob.name = j.metadata.name
            retJob.app = j.metadata.labels.kuberoapp
            retJob.pipeline = j.metadata.labels.kuberopipeline
            retJob.phase = j.metadata.labels.kuberophase || ''
            retJob.buildstrategy = j.metadata.labels.buildstrategy
            retJob.gitrepo = j.spec.template.spec.initContainers[0].env.find((e: any) => e.name == 'GIT_REPOSITORY').value
            retJob.gitref = j.spec.template.spec.initContainers[0].env.find((e: any) => e.name == 'GIT_REF').value
            retJob.image = j.spec.template.spec.containers[0].env.find((e: any) => e.name == 'REPOSITORY').value
            retJob.tag = j.spec.template.spec.containers[0].env.find((e: any) => e.name == 'TAG').value
            retJob.backoffLimit = j.spec.backoffLimit
            retJob.status = j.status

            if (j.status.failed) {
                retJob.state = 'Failed'
                retJob.duration = ( new Date(j.status.conditions[0].lastProbeTime).getTime() - new Date(j.status.startTime).getTime() )
            }
            if (j.status.active) {
                retJob.state = 'Active'
                retJob.duration = ( new Date().getTime() - new Date(j.status.startTime).getTime() ) 
            }
            if (j.status.succeeded) {
                retJob.state = 'Succeeded'
                retJob.duration = ( new Date(j.status.completionTime).getTime() - new Date(j.status.startTime).getTime() )
            }

            retJobs.push(retJob)
        }

        return retJobs.reverse()
    }

    public async triggerBuildjob(
            pipeline: string, 
            phase: string, 
            app: string, 
            buildstrategy: 'buildpacks' | 'dockerfile' | 'nixpacks' | 'plain',
            gitrepo: string, 
            reference: string, 
            dockerfilePath: string,
            user: User
        ): Promise<any> {

        if ( process.env.KUBERO_READONLY == 'true'){
            console.log('KUBERO_READONLY is set to true, not triggering build for app: '+app + ' in pipeline: '+pipeline);
            return;
        }

        const namespace = pipeline + "-" + phase
        
        if ( process.env.KUBERO_READONLY == 'true'){
            console.log('KUBERO_READONLY is set to true');
            return;
        }

        // Create the Pipeline CRD
        try {
            await this.kubectl.createBuildJob(
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
            console.log('kubectl.createBuildJob: Error creating Kubero build job', error)
        }
        
        const m = {
            'name': 'newBuild',
            'user': user.username,
            'resource': 'pipeline',
            'action': 'created',
            'severity': 'normal',
            'message': 'Created new Build Job: '+app + ' in pipeline: '+pipeline,
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

    public async deleteBuildjob(pipeline: string, phase: string, app: string, buildName: string, user: User): Promise<any> {

        if ( process.env.KUBERO_READONLY == 'true'){
            console.log('KUBERO_READONLY is set to true, not creating app: '+app + ' in pipeline: '+pipeline);
            return;
        }

        const namespace = pipeline + "-" + phase
        await this.kubectl.deleteKuberoBuildJob(namespace, buildName)
        
        const m = {
          'name': 'newBuild',
          'user': user.username,
          'resource': 'build',
          'action': 'deleted',
          'severity': 'normal',
          'message': 'Deleted Build Job: '+app + ' in pipeline: '+pipeline,
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