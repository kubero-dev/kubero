import { KuberoRabbitMQ } from './kuberoRabbitMQ';
import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoAddonMemcached extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'Memcached';
  public description =
    'Memcached is a high-performance, distributed memory object caching system, intended for use in speeding up dynamic web applications by alleviating database load.';
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
  public deprecated: boolean = false;

  public formfields: { [key: string]: IPluginFormFields } = {
    'KuberoAddonMemcached.metadata.name': {
      type: 'text',
      label: 'Memcached Instance Name',
      name: 'metadata.name',
      required: true,
      default: 'memcached',
      description: 'The name of the Memcached instance',
    },
    'KuberoAddonMemcached.spec.memcached.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['1.6.39'], // TODO - load this dynamically
      name: 'spec.memcached.image.tag',
      required: true,
      default: '1.6.39',
      description: 'Version of the Memcached image to use',
    },
    'KuberoAddonMemcached.spec.memcached.replicaCount': {
      type: 'number',
      label: 'Replica Count',
      name: 'spec.memcached.replicaCount',
      required: true,
      default: 1,
      description: 'Number of Memcached replicas',
    },
    'KuberoAddonMemcached.spec.memcached.config.memoryLimit': {
      type: 'number',
      label: 'Memory Limit (MB)',
      name: 'spec.memcached.config.memoryLimit',
      required: true,
      default: 64,
      description: 'Memory limit for Memcached in MB',
    },
    'KuberoAddonMemcached.spec.memcached.config.maxConnections': {
      type: 'number',
      label: 'Max Connections',
      name: 'spec.memcached.config.maxConnections',
      required: true,
      default: 1024,
      description: 'Maximum number of connections',
    },
  };

  public env: any[] = [];

  public resourceDefinitions: object = {
    KuberoAddonMemcached: {
      apiVersion: 'application.kubero.dev/v1alpha1',
      kind: 'KuberoAddonMemcached',
      metadata: {
        name: 'kuberoaddonmemcached-sample',
      },
      spec: {
        memcached: {
          image: {
            tag: '1.6.39',
          },
          replicaCount: 1,
          config: {
            memoryLimit: 64,
            maxConnections: 1024,
            extraArgs: [],
            verbosity: 0,
          },
          resources: {},
        },
      },
    },
  };

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
