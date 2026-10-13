import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoRabbitMQ extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'RabbitMQ (Bitnami)';
  public icon = '/img/addons/rabbitmq.svg';
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
    'KuberoRabbitMQ.metadata.name': {
      type: 'text',
      label: 'RabbitMQ Instance Name',
      name: 'metadata.name',
      required: true,
      default: 'rabbitmq',
      description: 'The name of the PostgreSQL instance',
    },
    'KuberoRabbitMQ.spec.rabbitmq.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['3.12.10-debian-11-r1', '3.13.7', '4.0.5', 'latest'], // TODO - load this dynamically
      name: 'spec.rabbitmq.image.tag',
      required: true,
      default: '3.12.10-debian-11-r1',
      description: 'Version of the PostgreSQL image to use',
    },
    'KuberoRabbitMQ.spec.rabbitmq.auth.username': {
      type: 'text',
      label: 'User Name*',
      name: 'spec.rabbitmq.auth.username',
      default: '',
      required: true,
      description: 'Username',
    },
    'KuberoRabbitMQ.spec.rabbitmq.global.auth.password': {
      type: 'text',
      label: 'User Password',
      name: 'spec.rabbitmq.auth.password',
      default: '',
      required: true,
      description: 'Password',
    },
    'KuberoRabbitMQ.spec.rabbitmq.global.rabbitmq.auth.securepassword': {
      type: 'text',
      label: 'Secure Password',
      name: 'spec.rabbitmq.global.rabbitmq.auth.securepassword',
      default: '',
      required: false,
      description: 'Secure Password',
    },
    'KuberoRabbitMQ.spec.rabbitmq.global.rabbitmq.auth.erlangCookie': {
      type: 'text',
      label: 'Erlang Cookie',
      name: 'spec.rabbitmq.global.rabbitmq.auth.erlangCookie',
      default: '',
      required: false,
      description: 'Erlang Cookie',
    },
    'KuberoRabbitMQ.spec.rabbitmq.global.storageClass': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.rabbitmq.global.storageClass',
      default: 'default',
      required: true,
    },
    'KuberoRabbitMQ.spec.rabbitmq.maxAvailableSchedulers': {
      type: 'number',
      label: 'Max Available Schedulers',
      name: 'spec.rabbitmq.maxAvailableSchedulers',
      default: '',
      required: false,
      description: 'Max available schedulers',
    },
    'KuberoRabbitMQ.spec.rabbitmq.onlineSchedulers': {
      type: 'number',
      label: 'Online Schedulers',
      name: 'spec.rabbitmq.onlineSchedulers',
      default: '',
      required: false,
      description: 'Online schedulers',
    },
  };

  public env: any[] = [];

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
