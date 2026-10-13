import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoPostgresql extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'Postgresql (Bitnami)';
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
  public deprecated: boolean = true;

  public formfields: { [key: string]: IPluginFormFields } = {
    'KuberoPostgresql.metadata.name': {
      type: 'text',
      label: 'PostgreSQL Instance Name',
      name: 'metadata.name',
      required: true,
      default: 'postgresql',
      description: 'The name of the PostgreSQL instance',
    },
    'KuberoPostgresql.spec.postgresql.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['13', '14', '15', '16.6.0', '17.2.0', 'latest'], // TODO - load this dynamically
      name: 'spec.postgresql.image.tag',
      required: true,
      default: '16',
      description: 'Version of the PostgreSQL image to use',
    },
    'KuberoPostgresql.spec.postgresql.global.postgresql.auth.postgresPassword':
      {
        type: 'text',
        label: 'Postgres admin Password*',
        name: 'spec.postgresql.global.postgresql.auth.postgresPassword',
        default: '',
        required: true,
        description: 'Password for the "postgres" admin user',
      },
    'KuberoPostgresql.spec.postgresql.global.postgresql.auth.username': {
      type: 'text',
      label: 'Username*',
      name: 'spec.postgresql.global.postgresql.auth.username',
      default: '',
      required: true,
      description: 'Username for an additional user to create',
    },
    'KuberoPostgresql.spec.postgresql.global.postgresql.auth.password': {
      type: 'text',
      label: 'User Password*',
      name: 'spec.postgresql.global.postgresql.auth.password',
      default: '',
      required: true,
      description: 'Password for an additional user to create',
    },
    'KuberoPostgresql.spec.postgresql.global.postgresql.auth.database': {
      type: 'text',
      label: 'Database*',
      name: 'spec.postgresql.global.postgresql.auth.database',
      default: 'postgresql',
      required: true,
      description: 'Name for a custom database to create',
    },
    'KuberoPostgresql.spec.postgresql.global.storageClass': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.postgresql.global.storageClass',
      default: 'default',
      required: true,
    },
    'KuberoPostgresql.spec.postgresql.primary.persistence.size': {
      type: 'text',
      label: 'Sorage Size*',
      name: 'spec.postgresql.primary.persistence.size',
      default: '1Gi',
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
