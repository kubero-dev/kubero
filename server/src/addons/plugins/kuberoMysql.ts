import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoMysql extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'MySQL (Bitnami)';
  public icon = '/img/addons/mysql.svg';
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
    'KuberoMysql.metadata.name': {
      type: 'text',
      label: 'MySQL DB Name',
      name: 'metadata.name',
      required: true,
      default: 'mysql',
      description: 'The name of the MySQL instance',
    },
    'KuberoMysql.spec.mysql.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: [
        '8.0.33-debian-11-r12',
        '8.1',
        '8.2-debian-11',
        '8.4.4',
        '9.0',
        'latest',
      ], // TODO - load this dynamically
      name: 'spec.mysql.image.tag',
      required: true,
      default: '8.1',
      description: 'Version of the PostgreSQL image to use',
    },
    'KuberoMysql.spec.mysql.global.storageClass': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.mysql.global.storageClass',
      default: 'standard',
      required: true,
    },
    'KuberoMysql.spec.mysql.primary.persistence.size': {
      type: 'text',
      label: 'Sorage Size*',
      name: 'spec.mysql.primary.persistence.size',
      default: '1Gi',
      required: true,
      description: 'Size of the storage',
    },
    'KuberoMysql.spec.mysql.auth.createDatabase': {
      type: 'switch',
      label: 'Create a Database*',
      name: 'spec.mysql.auth.createDatabase',
      default: false,
      required: false,
      description: 'Create a database on MySQL startup',
    },
    'KuberoMysql.spec.mysql.auth.database': {
      type: 'text',
      label: 'Database Name*',
      name: 'spec.mysql.auth.database',
      default: '',
      required: true,
      description: 'Name of the database to create',
    },
    'KuberoMysql.spec.mysql.auth.rootPassword': {
      type: 'text',
      label: 'Root Password*',
      name: 'spec.mysql.auth.rootPassword',
      default: '',
      required: true,
      description: 'Root Password',
    },
    'KuberoMysql.spec.mysql.auth.username': {
      type: 'text',
      label: 'Username*',
      name: 'spec.mysql.auth.username',
      default: '',
      required: true,
      description: 'Additional username',
    },
    'KuberoMysql.spec.mysql.auth.password': {
      type: 'text',
      label: 'User Password*',
      name: 'spec.mysql.auth.password',
      default: '',
      required: true,
      description: 'Password for the additional user',
    },
  };

  public env: any[] = [];

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
