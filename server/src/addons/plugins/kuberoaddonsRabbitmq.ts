import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoAddonRabbitmq extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'RabbitMQ';
  public description =
    'RabbitMQ is an open source general-purpose message broker that is designed for consistent, highly-available messaging scenarios (both synchronous and asynchronous).';
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
  public deprecated: boolean = false;

  public formfields: { [key: string]: IPluginFormFields } = {
    'KuberoAddonRabbitmq.metadata.name': {
      type: 'text',
      label: 'RabbitMQ Instance Name',
      name: 'metadata.name',
      required: true,
      default: 'rabbitmq',
      description: 'The name of the RabbitMQ instance',
    },
    'KuberoAddonRabbitmq.spec.rabbitmq.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['3', '4', 'latest'], // TODO - load this dynamically
      name: 'spec.rabbitmq.image.tag',
      required: true,
      default: '4',
      description: 'Version of the RabbitMQ version to use',
    },
    'KuberoAddonRabbitmq.spec.rabbitmq.authentication.erlangCookie.value': {
      type: 'text',
      label: 'RabbitMQ Erlang Cookie*',
      name: 'spec.rabbitmq.authentication.erlangCookie.value',
      default: '',
      required: true,
      description: 'Erlang cookie name for RabbitMQ',
    },
    'KuberoAddonRabbitmq.spec.rabbitmq.authentication.user.value': {
      type: 'text',
      label: 'Username*',
      name: 'spec.rabbitmq.authentication.user.value',
      default: '',
      required: true,
      description: 'Username for rabbitmq user to create',
    },
    'KuberoAddonRabbitmq.spec.rabbitmq.authentication.password.value': {
      type: 'text',
      label: 'User Password*',
      name: 'spec.rabbitmq.authentication.password.value',
      default: '',
      required: true,
      description: 'Password for rabbitmq user to create',
    },
    'KuberoAddonRabbitmq.spec.rabbitmq.storage.className': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.rabbitmq.storage.className',
      default: 'default',
      required: true,
    },
    'KuberoAddonRabbitmq.spec.rabbitmq.storage.requestedSize': {
      type: 'text',
      label: 'Storage Size*',
      name: 'spec.rabbitmq.storage.requestedSize',
      default: '1Gi',
      required: true,
      description: 'Size of the storage',
    },
  };

  public env: any[] = [];

  public resourceDefinitions: object = {
    KuberoAddonRabbitmq: {
      apiVersion: 'application.kubero.dev/v1alpha1',
      kind: 'KuberoAddonRabbitmq',
      metadata: {
        name: 'rabbitmq',
      },
      spec: {
        rabbitmq: {
          image: {
            tag: '',
          },
          replicaCount: 1,
          serviceMonitor: {
            enabled: false,
          },
          revisionHistoryLimit: null,
          clusterDomain: 'cluster.local',
          plugins: [],
          authentication: {
            user: {
              value: 'kubero_user',
            },
            password: {
              value: 'kubero_password',
            },
            erlangCookie: {
              value: 'kubero_erlang_cookie',
            },
          },
          options: {
            memoryHighWatermark: {
              enabled: false,
              type: 'relative',
              value: 0.4,
              pagingRatio: null,
            },
            memory: {
              totalAvailableOverrideValue: null,
              calculationStrategy: null,
            },
          },
          managementPlugin: {
            enabled: false,
          },
          prometheusPlugin: {
            enabled: true,
          },
          storage: {
            volumeName: 'rabbitmq-volume',
            requestedSize: null,
            className: null,
            accessModes: ['ReadWriteOnce'],
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
