import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoMongoDB extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'MongoDB  (Bitnami)';
  public icon = '/img/addons/mongo.svg';
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
    'KuberoMongoDB.metadata.name': {
      type: 'text',
      label: 'MongoDB Name',
      name: 'metadata.name',
      required: true,
      default: 'mongodb',
      description: 'The name of tht MongoDB instance',
    },
    'KuberoMongoDB.spec.mongodb.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['6.0.6-debian-11-r3', '7.0.15', '8.0', '8.0.4', 'latest'], // TODO - load this dynamically
      name: 'spec.mongodb.image.tag',
      required: true,
      default: '8.0',
      description: 'Version of the PostgreSQL image to use',
    },
    'KuberoMongoDB.spec.mongodb.global.storageClass': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.mongodb.global.storageClass',
      default: 'default',
      required: true,
    },
    'KuberoMongoDB.spec.mongodb.persistence.size': {
      type: 'text',
      label: 'Sorage Size*',
      name: 'spec.mongodb.persistence.size',
      default: '1Gi',
      required: true,
      description: 'Size of the storage',
    },
    'KuberoMongoDB.spec.mongodb.architecture': {
      type: 'select',
      label: 'Architecture*',
      options: ['standalone', 'replicaset'],
      name: 'spec.mongodb.architecture',
      default: 'standalone',
      required: true,
    },
    'KuberoMongoDB.spec.mongodb.auth.databases[0]': {
      type: 'text',
      label: 'Database*',
      name: 'spec.mongodb.auth.databases[0]',
      default: '',
      required: true,
      description: 'Database Name',
    },
    'KuberoMongoDB.spec.mongodb.auth.rootPassword': {
      type: 'text',
      label: 'Root Password*',
      name: 'spec.mongodb.auth.rootPassword',
      default: '',
      required: true,
      description: 'Root Password',
    },
    'KuberoMongoDB.spec.mongodb.auth.usernames[0]': {
      type: 'text',
      label: 'Username*',
      name: 'spec.mongodb.auth.usernames[0]',
      default: '',
      required: true,
      description: 'Additional username',
    },
    'KuberoMongoDB.spec.mongodb.auth.passwords[0]': {
      type: 'text',
      label: 'User Password*',
      name: 'spec.mongodb.auth.passwords[0]',
      default: '',
      required: true,
      description: 'Password for the additional user',
    },
    'KuberoMongoDB.spec.mongodb.directoryPerDB': {
      type: 'switch',
      label: 'Directory per DB',
      name: 'spec.mongodb.directoryPerDB',
      default: false,
      required: false,
      description: 'Directory per DB',
    },
    'KuberoMongoDB.spec.mongodb.disableJavascript': {
      type: 'switch',
      label: 'Disable Javascript',
      name: 'spec.mongodb.disableJavascript',
      default: false,
      required: false,
      description: 'Disable Javascript',
    },
    'KuberoMongoDB.spec.mongodb.replicaCount': {
      type: 'number',
      label: 'Replica Count*',
      name: 'spec.mongodb.replicaCount',
      default: 2,
      required: true,
      description: 'ReplicaCount Number of MongoDB nodes',
    },
  };

  public env: any[] = [];

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
