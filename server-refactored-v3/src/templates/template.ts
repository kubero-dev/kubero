import { ITemplate, IKubectlTemplate } from './templates.interface';
import { IApp, IExtraVolume, ICronjob } from '../apps/apps.interface';
import { IAddon } from '../addons/addons.interface';
import { IKubectlMetadata } from '../kubernetes/kubernetes.interface';

export class Template implements ITemplate{
  public name: string
  public deploymentstrategy: 'git' | 'docker'
  public envVars: {}[] = []
  /*
  public serviceAccount: {
      annotations: Object
      create: boolean,
      name: string,
  };
  */
  public extraVolumes: IExtraVolume[] = []
  public cronjobs: ICronjob[] = []
  public addons: IAddon[] = []

  public web: {
      replicaCount: number
  }

  public worker: {
      replicaCount: number
  }

  public image: {
      containerPort: number,
      pullPolicy?: 'Always',
      repository: string,
      tag: string,
      /*
      run: {
          repository: string,
          tag: string,
          readOnlyAppStorage?: boolean,
          securityContext: ISecurityContext
      }
      */
  };
  constructor(
      app: IApp
  ) {
      this.name = app.name
      this.deploymentstrategy = app.deploymentstrategy

      this.envVars =  app.envVars

      //this.serviceAccount = app.serviceAccount;
      
      this.extraVolumes =  app.extraVolumes

      this.cronjobs = app.cronjobs

      this.addons = app.addons

      this.web = {
          replicaCount: app.web.replicaCount
      }
      this.worker = {
          replicaCount: app.worker.replicaCount
      }

      this.image = {
          containerPort: app.image.containerPort,
          pullPolicy: 'Always',
          repository: app.image.repository || 'ghcr.io/kubero-dev/idler',
          tag: app.image.tag || 'v1',
          //run: app.image.run,
      }

      // function to set security context, required for backwards compatibility
      // Added in v1.11.0
      //this.image.run.securityContext = Buildpack.SetSecurityContext(this.image.run.securityContext)
  }
}

export class KubectlTemplate implements IKubectlTemplate{
    apiVersion: string;
    kind: string;
    metadata: IKubectlMetadata;
    spec: Template;
  
    constructor(app: IApp) {
        this.apiVersion = "application.kubero.dev/v1alpha1";
        this.kind = "KuberoApp";
        this.metadata = {
            name: app.name,
            annotations: {
                'kubero.dev/template.architecture': '[]',
                'kubero.dev/template.description': '',
                'kubero.dev/template.icon': '',
                'kubero.dev/template.installation': '',
                'kubero.dev/template.links': '[]',
                'kubero.dev/template.screenshots': '[]',
                'kubero.dev/template.source': '',
                'kubero.dev/template.categories': '[]',
                'kubero.dev/template.title': '',
                'kubero.dev/template.website': ''
            },
            labels: {
                manager: 'kubero',
            }
        }
        this.spec = new Template(app);
    }
}
  
  