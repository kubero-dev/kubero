
export type IKuberoBuildjob = {
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
  
/*
export interface DeploymentOptions {
    kubectl: Kubectl;
    notifications: Notifications;
    io: any;
    kubero: Kubero;
}
*/