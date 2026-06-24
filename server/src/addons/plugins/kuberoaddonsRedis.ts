import { KuberoRabbitMQ } from './kuberoRabbitMQ';
import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoAddonRedis extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'Redis';
  public description =
    'Redis(R) is an open source, advanced key-value store. It is often referred to as a data structure server since keys can contain strings, hashes, lists, sets and sorted sets.';
  public icon = '/img/addons/redis.svg';
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
    'KuberoAddonRedis.metadata.name': {
      type: 'text',
      label: 'Redis Instance Name',
      name: 'metadata.name',
      required: true,
      default: 'redis',
      description: 'The name of the Redis instance',
    },
    'KuberoAddonRedis.spec.redis.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['6', '7', '8', 'latest'], // TODO - load this dynamically
      name: 'spec.redis.image.tag',
      required: true,
      default: '8',
      description: 'Version of the Redis version to use',
    },
    'KuberoAddonRedis.spec.redis.haMode.enabled': {
      type: 'switch',
      label: 'High Availability Mode',
      name: 'spec.redis.haMode.enabled',
      default: false,
      required: false,
      description:
        'High availability mode (with master-slave replication and sentinel)',
    },
    'KuberoAddonRedis.spec.redis.haMode.replicas': {
      type: 'text',
      label: 'Number of Replicas',
      name: 'spec.redis.haMode.replicas',
      default: '3',
      required: true,
      description: 'Number of replicas in HA mode',
    },
    'KuberoAddonRedis.spec.redis.haMode.quorum': {
      type: 'text',
      label: 'Quorum',
      name: 'spec.redis.haMode.quorum',
      default: '2',
      required: true,
      description: 'Quorum for the Redis HA mode',
    },
    /*
    'KuberoAddonRedis.spec.redis.haMode.useDnsNames': {
      type: 'switch',
      label: 'Use DNS Names',
      name: 'spec.redis.haMode.useDnsNames',
      default: false,
      required: true,
      description: 'Use DNS names for Redis instances in HA mode',
    },
    */
    'KuberoAddonRedis.spec.redis.storage.className': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.redis.storage.className',
      default: 'default',
      required: true,
    },
    'KuberoAddonRedis.spec.redis.storage.requestedSize': {
      type: 'text',
      label: 'Storage Size*',
      name: 'spec.redis.storage.requestedSize',
      default: '1Gi',
      required: true,
      description: 'Size of the storage',
    },
  };

  public env: any[] = [];

  public resourceDefinitions: object = {
    KuberoAddonRedis: {
      apiVersion: 'application.kubero.dev/v1alpha1',
      kind: 'KuberoAddonRedis',
      metadata: {
        name: 'kuberoaddonredis-sample',
      },
      spec: {
        redis: {
          image: {
            tag: '',
          },
          metrics: {
            enabled: false,
          },
          resources: {},
          useDeploymentWhenNonHA: true,
          haMode: {
            enabled: false,
            useDnsNames: false,
            masterGroupName: 'redisha',
            replicas: 3,
            quorum: 2,
          },
          storage: {
            volumeName: 'redis-data',
            requestedSize: null,
            className: null,
            accessModes: ['ReadWriteOnce'],
            keepPvc: false,
          },
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
