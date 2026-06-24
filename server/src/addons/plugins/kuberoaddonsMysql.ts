import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoAddonMysql extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'MySQL';
  public description =
    'MySQL is a fast, reliable, scalable, and easy to use open source relational database system. Designed to handle mission-critical, heavy-load production applications.';
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
  public deprecated: boolean = false;

  public formfields: { [key: string]: IPluginFormFields } = {
    'KuberoAddonMysql.metadata.name': {
      type: 'text',
      label: 'MySQL Instance Name',
      name: 'metadata.name',
      required: true,
      default: 'mysql',
      description: 'The name of the MySQL instance',
    },
    'KuberoAddonMysql.spec.mysql.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['8', '9', 'lts', 'latest'], // TODO - load this dynamically
      name: 'spec.mysql.image.tag',
      required: true,
      default: '9',
      description: 'Version of the MySQL version to use',
    },
    'KuberoAddonMysql.spec.mysql.settings.rootPassword.value': {
      type: 'text',
      label: 'MySQL Root Password*',
      name: 'spec.mysql.settings.rootPassword.value',
      default: '',
      required: true,
      description: 'Password for the "mysql" admin user',
    },
    'KuberoAddonMysql.spec.mysql.userDatabase.user.value': {
      type: 'text',
      label: 'Username*',
      name: 'spec.mysql.userDatabase.user.value',
      default: '',
      required: true,
      description: 'Username for an additional user to create',
    },
    'KuberoAddonMysql.spec.mysql.userDatabase.password.value': {
      type: 'text',
      label: 'User Password*',
      name: 'spec.mysql.userDatabase.password.value',
      default: '',
      required: true,
      description: 'Password for an additional user to create',
    },
    'KuberoAddonMysql.spec.mysql.userDatabase.name.value': {
      type: 'text',
      label: 'Database*',
      name: 'spec.mysql.userDatabase.name.value',
      default: 'my_database',
      required: true,
      description: 'Name for a custom database to create',
    },
    'KuberoAddonMysql.spec.mysql.storage.className': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.mysql.storage.className',
      default: 'default',
      required: true,
    },
    'KuberoAddonMysql.spec.mysql.storage.requestedSize': {
      type: 'text',
      label: 'Storage Size*',
      name: 'spec.mysql.storage.requestedSize',
      default: '1Gi',
      required: true,
      description: 'Size of the storage',
    },
  };

  public env: any[] = [];

  public resourceDefinitions: object = {
    KuberoAddonMysql: {
      apiVersion: 'application.kubero.dev/v1alpha1',
      kind: 'KuberoAddonMysql',
      metadata: {
        name: 'mysql',
      },
      spec: {
        mysql: {
          image: {
            tag: '',
          },
          resources: {},
          useDeployment: true,
          settings: {
            rootPassword: {
              value: 'postgres',
            },
          },
          userDatabase: {
            name: {
              value: 'kubero_database',
            },
            user: {
              value: 'kubero_user',
            },
            password: {
              value: 'kubero_password',
            },
          },
          storage: {
            volumeName: 'postgres-data',
            requestedSize: '1Gi',
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
