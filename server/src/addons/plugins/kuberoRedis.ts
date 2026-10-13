import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoRedis extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'Redis (Bitnami)';
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
  public deprecated: boolean = true;

  public formfields: { [key: string]: IPluginFormFields } = {
    'KuberoRedis.metadata.name': {
      type: 'text',
      label: 'Redis Cluster Name',
      name: 'metadata.name',
      required: true,
      default: 'redis',
      description: 'The name of the redis instance',
    },
    'KuberoRedis.spec.redis.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['7.0.7-debian-11-r7', '6.2', '7.4.2', 'latest'], // TODO - load this dynamically
      name: 'spec.redis.image.tag',
      required: true,
      default: '7.0-debian-12',
      description: 'Version of the PostgreSQL image to use',
    },
    'KuberoRedis.spec.redis.replica.replicaCount': {
      type: 'number',
      label: 'Replica Count*',
      name: 'spec.redis.replica.replicaCount',
      default: '3',
      required: true,
      description: 'Number of replicas',
    },
    'KuberoRedis.spec.redis.global.storageClass': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.redis.global.storageClass',
      default: 'default',
      required: true,
    },
    'KuberoRedis.spec.redis.master.persistence.size': {
      type: 'text',
      label: 'Master Sorage Size*',
      name: 'spec.redis.master.persistence.size',
      default: '1Gi',
      required: true,
      description: 'Size of the storage',
    },
    'KuberoRedis.spec.redis.replica.persistence.size': {
      type: 'text',
      label: 'Replica Sorage Size*',
      name: 'spec.redis.replica.persistence.size',
      default: '1Gi',
      required: true,
      description: 'Size of the storage',
    },
    'KuberoRedis.spec.redis.global.redis.password': {
      type: 'text',
      label: 'Password*',
      name: 'spec.redis.global.redis.password',
      default: '',
      required: true,
      description: 'Password',
    },
  };

  public env: any[] = [];

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
