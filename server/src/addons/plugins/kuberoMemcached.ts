import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoMemcached extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'Memcached (Bitnami)';
  public icon = '/img/addons/memcached.svg';
  public install: string = '';
  public url =
    'https://artifacthub.io/packages/olm/community-operators/kubero-operator';
  public docs = [
    {
      title: 'Kubero Docs',
      url: '',
    },
  ];
  public artifact_url =
    'https://artifacthub.io/api/v1/packages/olm/kubero/kubero-operator';
  public beta: boolean = false;
  public deprecated: boolean = true;

  public formfields: { [key: string]: IPluginFormFields } = {
    'KuberoMemcached.metadata.name': {
      type: 'text',
      label: 'Name',
      name: 'metadata.name',
      required: true,
      default: 'memcached',
      description: 'The name of the Memcached instance',
    },
    'KuberoMemcached.spec.memcached.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['1.6.22-debian-11-r1', '1', '1.6.34', 'latest'], // TODO - load this dynamically
      name: 'spec.memcached.image.tag',
      required: true,
      default: '1.6.22-debian-11-r1',
      description: 'Version of the PostgreSQL image to use',
    },
    'KuberoMemcached.spec.memcached.architecture': {
      type: 'select',
      label: 'Architecture*',
      options: ['standalone', 'high-availability'],
      name: 'spec.memcached.architecture',
      default: 'standalone',
      required: true,
      description: 'Architecture of the Memcached instance',
    },
    'KuberoMemcached.spec.memcached.global.storageClass': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.memcached.global.storageClass',
      default: 'default',
      required: true,
    },
    'KuberoMemcached.spec.memcached.auth.enabled': {
      type: 'switch',
      label: 'Enable Authentication',
      name: 'spec.memcached.auth.username',
      default: true,
      required: false,
      description: 'Enable Memcached authentication',
    },
    'KuberoMemcached.spec.memcached.auth.username': {
      type: 'text',
      label: 'Username',
      name: 'spec.memcached.auth.username',
      default: '',
      required: false,
      description: 'Memcached admin user',
    },
    'KuberoMemcached.spec.memcached.auth.password': {
      type: 'text',
      label: 'Password',
      name: 'spec.memcached.auth.password',
      default: '',
      required: false,
      description: 'Memcached admin password',
    },
    'KuberoMemcached.spec.memcached.resources.requests.memory': {
      type: 'text',
      label: 'Memory',
      name: 'spec.memcached.resources.requests.memory',
      default: '256Mi',
      required: true,
      description: 'Memcached memory reservation',
    },
    'KuberoMemcached.spec.memcached.replicaCount': {
      type: 'number',
      label: 'Replica Count',
      name: 'spec.memcached.replicaCount',
      default: 1,
      required: true,
      description: 'Number of Memcached replicas',
    },
    'KuberoMemcached.spec.memcached.autoscaling.enabled': {
      type: 'switch',
      label: 'Enable Autoscaling',
      name: 'spec.memcached.autoscaling.enabled',
      default: true,
      required: false,
      description: 'Requires Architecture "high-avialable"',
    },
    'KuberoMemcached.spec.memcached.autoscaling.minReplicas': {
      type: 'number',
      label: 'Min Replica Count',
      name: 'spec.memcached.autoscaling.minReplicas',
      default: 3,
      required: false,
      description: 'Minimal number of Memcached replicas',
    },
    'KuberoMemcached.spec.memcached.autoscaling.maxReplicas': {
      type: 'number',
      label: 'Max Replica Count',
      name: 'spec.memcached.autoscaling.maxReplicas',
      default: 6,
      required: false,
      description: 'Maximal number of Memcached replicas',
    },
  };

  public env: any[] = [];

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
