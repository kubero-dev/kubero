import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class Tunnel extends Plugin implements IPlugin {
  public id: string = 'cloudflare-operator'; //same as operator name
  public displayName = 'Cloudflare Tunnel';
  public icon = '/img/addons/cloudflare.svg';
  public install: string =
    'kubectl apply -k https://github.com/adyanth/cloudflare-operator/config/default';
  public url = 'https://github.com/adyanth/cloudflare-operator';
  public description: string =
    "Cloudflared establishes outbound connections (tunnels) between your resources and Cloudflare's global network. Tunnels are persistent objects that route traffic to DNS records. Within the same tunnel, you can run as many cloudflared processes (connectors) as needed.";
  public links = [
    {
      name: 'Getting started',
      url: 'https://github.com/adyanth/cloudflare-operator/blob/main/docs/getting-started.md',
    },
    {
      name: 'Cloudflare Tunnel',
      url: 'https://developers.cloudflare.com/cloudflare-one/connections/connect-apps',
    },
    {
      name: 'Blog Post',
      url: 'https://adyanth.site/posts/migration-compose-k8s/cloudflare-tunnel-operator-architecture/',
    },
  ];
  public maintainers = [
    {
      name: 'Adyanth Hosavalike',
      email: 'me@adyanth.dev',
      url: 'https://adyanth.site',
      github: 'adyanth',
    },
  ];
  public artifact_url = 'https://www.httpbin.org/status/404'; // Not available on ArtifactHub
  public beta: boolean = true;

  public formfields: { [key: string]: IPluginFormFields } = {
    'Tunnel.metadata.name': {
      type: 'text',
      label: 'Name',
      name: 'metadata.name',
      required: true,
      default: 'cloudflare-tunnel',
      description: 'The name of the Cloudflare Tunnel',
    },
    'Tunnel.spec.cloudflare.domain': {
      type: 'text',
      label: 'Domain*',
      name: 'spec.memcached.domain',
      default: '',
      required: true,
      description: 'Memcached admin user',
    },
    'Tunnel.spec.cloudflare.email': {
      type: 'text',
      label: 'E-mail*',
      name: 'spec.cloudflare.email',
      default: '',
      required: true,
      description: 'Email address associated with the Cloudflare account',
    },
    'Tunnel.spec.cloudflare.accountName': {
      type: 'text',
      label: 'Account Name*',
      name: 'spec.cloudflare.accountName',
      default: '',
      required: true,
      description: 'Cloudflare Account Name',
    },
    /* Fallback to Account Name
        'Tunnel.spec.cloudflare.accountId':{
            type: 'text',
            label: 'Account ID',
            name: 'spec.cloudflare.accountId',
            default: '',
            required: false,
            description: 'Cloudflare Account ID'
        },
        */
    'Tunnel.spec.cloudflare.CLOUDFLARE_API_TOKEN': {
      type: 'text',
      label: 'API Token*',
      name: 'spec.cloudflare.CLOUDFLARE_API_TOKEN',
      default: '',
      required: true,
      description: 'Cloudflare API Token',
    },
    'Tunnel.spec.cloudflare.CLOUDFLARE_API_KEY': {
      type: 'text',
      label: 'API Key*',
      name: 'spec.cloudflare.CLOUDFLARE_API_KEY',
      default: '',
      required: true,
      description: 'Cloudflare API Key',
    },
  };

  public env: any[] = [];

  protected additionalResourceDefinitions: object = {};

  public resourceDefinitions: any = {
    Tunnel: {
      apiVersion: 'networking.cfargotunnel.com/v1alpha1',
      kind: 'Tunnel',
      metadata: {
        name: 'new-tunnel',
      },
      spec: {
        newTunnel: {
          name: 'new-k8s-tunnel',
        },
        size: 2,
        cloudflare: {
          domain: 'example.com',
          secret: 'cloudflare-secrets',
          email: 'email@domain.com',
          accountName: '<Cloudflare account name>',
          //accountId: "<Cloudflare account ID>",
          CLOUDFLARE_API_TOKEN: '<override key to be used reading from secret>',
          CLOUDFLARE_API_KEY: '<override key to be used reading from secret>',
        },
      },
    },
  };

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
