import { Injectable, Logger } from '@nestjs/common';
import {
  IPipelineList,
  IPipeline,
  IKubectlPipelineList,
} from './pipelines.interface';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { Buildpack } from '../config/buildpack/buildpack';
import { IUser } from '../auth/auth.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { INotification } from '../notifications/notifications.interface';
import { IApp } from '../apps/apps.interface';
@Injectable()
export class PipelinesService {
  private readonly logger = new Logger(PipelinesService.name);
  //private pipelineStateList = [] as IPipeline[]; //DEPRECATED: should not be used but reloaded live state

  constructor(
    private kubectl: KubernetesService,
    private notificationsService: NotificationsService,
  ) {}

  public async listPipelines(
    userGroups: string[] = [],
  ): Promise<IPipelineList> {
    //this.logger.debug('listPipelines for userGroups: ' + userGroups.join(', '));
    let pipelines = await this.kubectl.getPipelinesList(userGroups);

    const ret: IPipelineList = {
      items: [],
    };
    for (const pipeline of pipelines.items) {
      ret.items.push(pipeline.spec);
    }
    return ret;
  }

  public async getPipelineWithApps(
    pipelineName: string,
    userGroups: string[] = [],
  ): Promise<IPipeline | undefined> {
    this.logger.debug('listApps in ' + pipelineName);

    await this.kubectl.setCurrentContext(
      process.env.KUBERO_CONTEXT || 'default',
    );
    const kpipeline = await this.kubectl.getPipeline(pipelineName);

    if (!kpipeline.spec || !kpipeline.spec.git || !kpipeline.spec.git.keys) {
      return;
    }

    delete kpipeline.spec.git.keys.priv;
    delete kpipeline.spec.git.keys.pub;

    const pipeline = kpipeline.spec;

    if (pipeline) {
      for (const phase of pipeline.phases) {
        if (phase.enabled == true) {
          const contextName = await this.getContext(
            pipelineName,
            phase.name,
            userGroups,
          );
          if (contextName) {
            const namespace = pipelineName + '-' + phase.name;
            const apps = await this.kubectl.getAppsList(namespace, contextName);

            const appslist = [] as IApp[];
            for (const app of apps.items) {
              appslist.push(app.spec);
            }
            // @ts-expect-error ts(2532) FIXME: Object is possibly 'undefined'.
            pipeline.phases.find((p) => p.name == phase.name).apps = appslist;
          }
        }
      }
    }
    return pipeline;
  }

  public async getContext(
    pipelineName: string,
    phaseName: string,
    userGroups: string[],
  ): Promise<string> {
    let context: string = 'missing-' + pipelineName + '-' + phaseName;
    const pipelinesList = await this.listPipelines(userGroups);

    for (const pipeline of pipelinesList.items) {
      if (pipeline.name == pipelineName) {
        for (const phase of pipeline.phases) {
          if (phase.name == phaseName) {
            //this.kubectl.setCurrentContext(phase.context);
            context = phase.context;
          }
        }
      }
    }
    return context;
  }

  public async getPipeline(
    pipelineName: string,
  ): Promise<IPipeline | undefined> {
    this.logger.debug('getPipeline: ' + pipelineName);

    const pipeline = await this.kubectl
      .getPipeline(pipelineName)
      .catch((error) => {
        this.logger.error(error);
        return undefined;
      });

    if (pipeline) {
      if (pipeline.spec.buildpack) {
        pipeline.spec.buildpack.fetch.securityContext =
          Buildpack.SetSecurityContext(
            pipeline.spec.buildpack.fetch.securityContext,
          );
        pipeline.spec.buildpack.build.securityContext =
          Buildpack.SetSecurityContext(
            pipeline.spec.buildpack.build.securityContext,
          );
        pipeline.spec.buildpack.run.securityContext =
          Buildpack.SetSecurityContext(
            pipeline.spec.buildpack.run.securityContext,
          );
      }

      if (pipeline.metadata && pipeline.metadata.resourceVersion) {
        pipeline.spec.resourceVersion = pipeline.metadata.resourceVersion;
      }

      delete pipeline.spec.git.keys.priv;
      delete pipeline.spec.git.keys.pub;
      return pipeline.spec;
    }
  }

  // delete a pipeline and all its namespaces/phases
  public deletePipeline(pipelineName: string, user: IUser) {
    this.logger.debug('deletePipeline: ' + pipelineName);

    if (process.env.KUBERO_READONLY == 'true') {
      console.log(
        'KUBERO_READONLY is set to true, not deleting pipeline ' + pipelineName,
      );
      return;
    }

    this.kubectl
      .getPipeline(pipelineName)
      .then(async (pipeline) => {
        if (pipeline) {
          await this.kubectl.deletePipeline(pipelineName);

          await new Promise((resolve) => setTimeout(resolve, 1000)); // needs some extra time to delete the namespace
          //this.updateState();

          const m = {
            name: 'updatePipeline',
            user: user.id,
            resource: 'pipeline',
            action: 'delete',
            severity: 'normal',
            message: 'Deleted pipeline: ' + pipelineName,
            pipelineName: pipelineName,
            phaseName: '',
            appName: '',
            data: {
              pipeline: pipeline,
            },
          } as INotification;
          this.notificationsService.send(m);
        }
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }
  public async updatePipeline(
    pipeline: IPipeline,
    resourceVersion: string,
    user: IUser,
  ) {
    this.logger.debug('update Pipeline: ' + pipeline.name);

    if (process.env.KUBERO_READONLY == 'true') {
      this.logger.log(
        'KUBERO_READONLY is set to true, not updating pipelline ' +
          pipeline.name,
      );
      return;
    }

    const currentPL = await this.kubectl
      .getPipeline(pipeline.name)
      .catch((error) => {
        this.logger.error(error);
      });

    pipeline.git.keys.priv = currentPL?.spec.git.keys.priv;
    pipeline.git.keys.pub = currentPL?.spec.git.keys.pub;

    // Create the Pipeline CRD
    await this.kubectl.updatePipeline(pipeline, resourceVersion);
    //this.updateState();

    await new Promise((resolve) => setTimeout(resolve, 500));
    const m = {
      name: 'updatePipeline',
      user: user.id,
      resource: 'pipeline',
      action: 'update',
      severity: 'normal',
      message: 'Updated pipeline: ' + pipeline.name,
      pipelineName: pipeline.name,
      phaseName: '',
      appName: '',
      data: {
        pipeline: pipeline,
      },
    } as INotification;
    this.notificationsService.send(m);
  }

  public async createPipeline(pipeline: IPipeline, user: IUser) {
    this.logger.debug('create Pipeline: ' + pipeline.name);

    if (process.env.KUBERO_READONLY == 'true') {
      console.log(
        'KUBERO_READONLY is set to true, not creting pipeline ' + pipeline.name,
      );
      return;
    }

    // Create the Pipeline CRD
    await this.kubectl.createPipeline(pipeline);
    //this.updateState();

    const m = {
      name: 'updatePipeline',
      user: user.id,
      resource: 'pipeline',
      action: 'created',
      severity: 'normal',
      message: 'Created new pipeline: ' + pipeline.name,
      pipelineName: pipeline.name,
      phaseName: '',
      appName: '',
      data: {
        pipeline: pipeline,
      },
    } as INotification;
    this.notificationsService.send(m);

    return { status: 'ok', message: 'Pipeline created: ' + pipeline.name };
  }

  public async countPipelines(): Promise<number> {
    const pipelines = await this.kubectl.getPipelinesList();
    return pipelines.items.length;
  }
}
