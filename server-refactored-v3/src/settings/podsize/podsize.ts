import { IPodSize } from '../settings.interface';

export class PodSize implements IPodSize {
  public name: string;
  public description: string;
  public default?: boolean | undefined;
  public resources: {
    requests?:
      | {
          memory: string;
          cpu: string;
        }
      | undefined;
    limits?:
      | {
          memory: string;
          cpu: string;
        }
      | undefined;
  };
  constructor(ps: IPodSize) {
    this.name = ps.name;
    this.description = ps.description;
    this.default = ps.default;
    this.resources = {
      requests: {
        memory: ps.resources.requests?.memory || '',
        cpu: ps.resources.requests?.cpu || '',
      },
      limits: {
        memory: ps.resources.limits?.memory || '',
        cpu: ps.resources.limits?.cpu || '',
      },
    };
  }
}
