import { Injectable, Logger } from '@nestjs/common';
import { IPipelineList, IPipeline } from './pipelines.interface';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { Buildpack } from '../settings/buildpack/buildpack';
import { IUser } from 'src/auth/auth.interface';

@Injectable()
export class PipelinesService {
  private readonly logger = new Logger(PipelinesService.name);
  //private pipelineStateList = [] as IPipeline[]; //DEPRECATED: should not be used but reloaded live state

  constructor(private kubectl: KubernetesService) {}

  public async listPipelines(): Promise<IPipelineList> {
    this.logger.debug('listPipelines');
    let pipelines = await this.kubectl.getPipelinesList();
    const ret: IPipelineList = {
      items: new Array()
    }
    for (const pipeline of pipelines.items) {
      this.logger.debug('listed pipeline: '+pipeline.spec.name);
      ret.items.push(pipeline.spec);
    }
    return ret;
  }

  public async getPipelineWithApps(pipelineName: string) {
    this.logger.debug('listApps in '+pipelineName);

    await this.kubectl.setCurrentContext(process.env.KUBERO_CONTEXT || 'default');
    const kpipeline = await this.kubectl.getPipeline(pipelineName);

    if (!kpipeline.spec || !kpipeline.spec.git || !kpipeline.spec.git.keys) {
        return;
    }

    delete kpipeline.spec.git.keys.priv
    delete kpipeline.spec.git.keys.pub

    let pipeline = kpipeline.spec

    if (pipeline) {
        for (const phase of pipeline.phases) {
            if (phase.enabled == true) {

                const contextName = await this.getContext(pipelineName, phase.name);
                if (contextName) {
                    const namespace = pipelineName+'-'+phase.name;
                    let apps = await this.kubectl.getAppsList(namespace, contextName);

                    let appslist = new Array();
                    for (const app of apps.items) {
                        appslist.push(app.spec);
                    }
                    // @ts-expect-error ts(2532) FIXME: Object is possibly 'undefined'.
                    pipeline.phases.find(p => p.name == phase.name).apps = appslist;

                }
            }
        }
    }
    return pipeline;
  }

  public async getContext(pipelineName: string, phaseName: string): Promise<string> {
    let context: string = 'missing-'+pipelineName+'-'+phaseName;
    const pipelinesList = await this.listPipelines()

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
    return context
  }

  public async getPipeline(pipelineName: string): Promise<IPipeline | undefined>{
    this.logger.debug('getPipeline: '+pipelineName);

    let pipeline = await this.kubectl.getPipeline(pipelineName)
    .catch(error => {
        this.logger.error(error);
        return undefined;
    });

    if (pipeline) {
        if (pipeline.spec.buildpack) {
            pipeline.spec.buildpack.fetch.securityContext = Buildpack.SetSecurityContext(pipeline.spec.buildpack.fetch.securityContext);
            pipeline.spec.buildpack.build.securityContext = Buildpack.SetSecurityContext(pipeline.spec.buildpack.build.securityContext);
            pipeline.spec.buildpack.run.securityContext = Buildpack.SetSecurityContext(pipeline.spec.buildpack.run.securityContext);
        }

        if (pipeline.metadata && pipeline.metadata.resourceVersion) {
            pipeline.spec.resourceVersion = pipeline.metadata.resourceVersion;
        }

        delete pipeline.spec.git.keys.priv
        delete pipeline.spec.git.keys.pub
        return pipeline.spec;
    }
  }

  // delete a pipeline and all its namespaces/phases
  public deletePipeline(pipelineName: string, user: IUser) {
    this.logger.debug('deletePipeline: '+pipelineName);

    if ( process.env.KUBERO_READONLY == 'true'){
        console.log('KUBERO_READONLY is set to true, not deleting pipeline '+ pipelineName);
        return;
    }

    this.kubectl.getPipeline(pipelineName).then(async pipeline =>{
        if (pipeline) {
            await this.kubectl.deletePipeline(pipelineName);

            await new Promise(resolve => setTimeout(resolve, 5000)); // needs some extra time to delete the namespace
            //this.updateState();
            
            /* Might be moved to a notification middleware
            const m = {
                'name': 'deletePipeline',
                'user': user.username,
                'resource': 'pipeline',
                'action': 'delete',
                'severity': 'normal',
                'message': 'Deleted pipeline: '+pipelineName,
                'pipelineName':pipelineName,
                'phaseName': '',
                'appName': '',
                'data': {
                    'pipeline': pipeline
                }
            } as INotification;
            this.notification.send(m, this._io);
            */
        }
    })
    .catch(error => {
        this.logger.error(error);
    });
  }

  /*
  public updateState() {
    this.pipelineStateList = [];
    this.appStateList = [];
    this.listPipelines().then(pl => {
        for (const pipeline of pl.items as IPipeline[]) {
            this.pipelineStateList.push(pipeline);

            for (const phase of pipeline.phases) {

                if (phase.enabled == true) {
                    debug.log("🔁 Loading Namespace: "+pipeline.name+"-"+phase.name);
                    this.listAppsInNamespace(pipeline.name, phase.name)
                    .then(appsList => {
                        if (appsList) {
                            for (const app of appsList.items) {
                                debug.log("🔁 Loading App: "+app.spec.name);
                                this.appStateList.push(app.spec);
                            }
                        }
                    })
                    .catch(error => {
                        debug.log(error);
                    })
                }
            }
        }
    }
    ).catch(error => {
        debug.log(error);
    });
  }
  */
}
