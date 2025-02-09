import { Injectable, Logger } from '@nestjs/common';
import { PipelinesService } from '../pipelines/pipelines.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';

@Injectable()
export class AppsService {

  private Logger = new Logger(AppsService.name);

  constructor(
    private kubectl: KubernetesService,
    private pipelinesService: PipelinesService
  ) {}
  
  public async getApp(pipelineName: string, phaseName: string, appName: string) {
    this.Logger.debug('get App: '+appName+' in '+ pipelineName+' phase: '+phaseName);
    const contextName = await this.pipelinesService.getContext(pipelineName, phaseName);
    
    if (contextName) {
        let app = await this.kubectl.getApp(pipelineName, phaseName, appName, contextName);
        return app;
    }
  }
}
