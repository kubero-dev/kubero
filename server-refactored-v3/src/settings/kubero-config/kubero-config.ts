import { IKuberoConfig, IPodSize, IBuildpack } from '../settings.interface';
import { Buildpack } from '../buildpack/buildpack';
import { PodSize } from '../podsize/podsize';

export class KuberoConfig {
  public podSizeList: IPodSize[];
  public buildpacks: IBuildpack[];
  public clusterissuer: string;
  public templates: {
    enabled: boolean;
    catalogs: [
      {
        name: string;
        description: string;
        index: {
          url: string;
          format: string;
        };
      },
    ];
  };
  public kubero: {
    console: {
      enabled: boolean;
    };
    readonly: boolean;
    banner: {
      message: string;
      bgcolor: string;
      fontcolor: string;
      show: boolean;
    };
  };
  constructor(kc: IKuberoConfig) {
    this.podSizeList = kc.podSizeList;
    this.buildpacks = kc.buildpacks;
    this.clusterissuer = kc.clusterissuer;
    this.templates = kc.templates;
    this.kubero = kc.kubero;

    for (let i = 0; i < this.buildpacks.length; i++) {
      this.buildpacks[i] = new Buildpack(kc.buildpacks[i]);
    }

    for (let i = 0; i < this.podSizeList.length; i++) {
      this.podSizeList[i] = new PodSize(kc.podSizeList[i]);
    }
  }
}
