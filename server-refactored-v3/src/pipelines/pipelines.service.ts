import { Injectable, Logger } from '@nestjs/common';
import { IPipelineList } from './pipelines.interface';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';

@Injectable()
export class PipelinesService {
  private readonly logger = new Logger(PipelinesService.name);

  constructor(private kubectl: KubernetesService) {}

  public async listPipelines(): Promise<IPipelineList> {
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
}
