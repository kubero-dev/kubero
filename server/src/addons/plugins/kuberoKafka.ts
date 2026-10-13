import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoKafka extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'Kafka (Bitnami)';
  public icon = '/img/addons/kafka.svg';
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
    'KuberoKafka.metadata.name': {
      type: 'text',
      label: 'Kafka DB Name',
      name: 'metadata.name',
      required: true,
      default: 'kafka',
      description: 'The name of the Kafka instance',
    },
    'KuberoKafka.spec.kafka.global.storageClass': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.kafka.global.storageClass',
      default: 'default',
      required: true,
    },
    'KuberoKafka.spec.kafka.persistence.size': {
      type: 'text',
      label: 'Storage Size*',
      name: 'spec.kafka.persistence.size',
      default: '8Gi',
      required: true,
      description: 'Size of the storage',
    },
  };

  public env: any[] = [];

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
