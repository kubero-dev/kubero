import { Plugin, } from './plugin';
import { IPlugin, IPluginFormFields  } from './plugin.interface';


// Classname must be same as the CRD's Name
export class KuberoAddonPostgres extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'PostgreSQL';
  public description = 'PostgreSQL (Postgres) is an open source object-relational database known for reliability and data integrity. ACID-compliant, it supports foreign keys, joins, views, triggers and stored procedures.';
  public icon = '/img/addons/pgsql.svg';
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
    'KuberoAddonPostgres.metadata.name': {
      type: 'text',
      label: 'PostgreSQL Instance Name',
      name: 'metadata.name',
      required: true,
      default: 'postgres',
      description: 'The name of the PostgreSQL instance',
    },
    'KuberoAddonPostgres.spec.postgres.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['13', '14', '15', '16', '17', 'latest'], // TODO - load this dynamically
      name: 'spec.postgres.image.tag',
      required: true,
      default: '16',
      description: 'Version of the PostgreSQL version to use',
    },
    /*
    'KuberoAddonPostgres.spec.postgres.settings.superuser.value': {
      type: 'text',
      label: 'Postgres Superuser*',
      name: 'spec.postgres.settings.superuser.value',
      default: 'postgres',
      required: true,
      description: 'Username for the "postgres" admin user',
    },
    */
    'KuberoAddonPostgres.spec.postgres.settings.superuserPassword.value': {
      type: 'text',
      label: 'Postgres Superuser Password*',
      name: 'spec.postgres.settings.superuserPassword.value',
      default: '',
      required: true,
      description: 'Password for the "postgres" admin user',
    },
    'KuberoAddonPostgres.spec.postgres.userDatabase.user.value': {
      type: 'text',
      label: 'Username*',
      name: 'spec.postgres.userDatabase.user.value',
      default: '',
      required: true,
      description: 'Username for an additional user to create',
    },
    'KuberoAddonPostgres.spec.postgres.userDatabase.password.value': {
      type: 'text',
      label: 'User Password*',
      name: 'spec.postgres.userDatabase.password.value',
      default: '',
      required: true,
      description: 'Password for an additional user to create',
    },
    'KuberoAddonPostgres.spec.postgres.userDatabase.name.value': {
      type: 'text',
      label: 'Database*',
      name: 'spec.postgres.userDatabase.name.value',
      default: 'postgresql',
      required: true,
      description: 'Name for a custom database to create',
    },
    'KuberoAddonPostgres.spec.postgres.storage.className': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.postgres.storage.className',
      default: 'default',
      required: true,
    },
    'KuberoAddonPostgres.spec.postgres.storage.requestedSize': {
      type: 'text',
      label: 'Storage Size*',
      name: 'spec.postgres.storage.requestedSize',
      default: '1Gi',
      required: true,
      description: 'Size of the storage',
    },
  };

  public env: any[] = [];

  public resourceDefinitions: object = {
    KuberoAddonPostgres: {
      apiVersion: "application.kubero.dev/v1alpha1",
      kind: "KuberoAddonPostgres",
      metadata: {
        name: "kuberoaddonpostgres-sample"
      },
      spec: {
        postgres: {
          image: {
            tag: ""
          },
          resources: {},
          useDeployment: true,
          settings: {
            superuser: {
              value: "postgres"
            },
            superuserPassword: {
              value: "changeme"
            }
          },
          userDatabase: {
            name: {
              value: "kubero_database"
            },
            user: {
              value: "kubero_user"
            },
            password: {
              value: "kubero_password"
            }
          },
          storage: {
            volumeName: "postgres-data",
            requestedSize: "1Gi",
            className: null,
            accessModes: [
              "ReadWriteOnce"
            ],
            keepPvc: false
          }
        }
      }
    },
  }

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
