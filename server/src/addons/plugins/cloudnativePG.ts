import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class Cluster extends Plugin implements IPlugin {
  public id: string = 'Cluster'; //same as operator name
  public displayName = 'PostgreSQL (CloudNativePG)';
  public description: string =
    'CloudNativePG is the Kubernetes operator that covers the full lifecycle of a highly available PostgreSQL database cluster with a primary/standby architecture, using native streaming replication.';
  public icon = '/img/addons/pgsql.svg';
  public install: string =
    'kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.27/releases/cnpg-1.27.0.yaml';
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
    'CloudnativePG.metadata.name': {
      type: 'text',
      label: 'PostgreSQL Instance Name',
      name: 'metadata.name',
      required: true,
      default: 'postgresql',
      description: 'The name of the PostgreSQL instance',
    },
    'CloudnativePG.spec.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: [
        'ghcr.io/cloudnative-pg/postgresql:17-minimal-bookworm',
        'ghcr.io/cloudnative-pg/postgresql:16-minimal-bookworm',
        'ghcr.io/cloudnative-pg/postgresql:15-minimal-bookworm',
      ], // TODO - load this dynamically
      name: 'spec.image.tag',
      required: true,
      default: 'ghcr.io/cloudnative-pg/postgresql:17-minimal-bookworm',
      description: 'Version of the PostgreSQL version to use',
    },
    'superuserSecret.stringData.username': {
      type: 'text',
      label: 'PostgreSQL RootUser*',
      name: 'superuserSecret.stringData.username',
      default: 'postgres',
      required: true,
      description: 'Username for the root user',
    },

    'superuserSecret.stringData.password': {
      type: 'text',
      label: 'PostgreSQL Root Password*',
      name: 'superuserSecret.stringData.password',
      default: '',
      required: true,
      description: 'Password for the root user',
    },
    'appUserSecret.stringData.username': {
      type: 'text',
      label: 'Username*',
      name: 'appUserSecret.stringData.username',
      default: '',
      required: true,
      description: 'Username for an additional user to create',
    },
    'appUserSecret.stringData.password': {
      type: 'text',
      label: 'User Password*',
      name: 'appUserSecret.stringData.password',
      default: '',
      required: true,
      description: 'Password for an additional user to create',
    },
    'CloudnativePG.spec.instances': {
      type: 'number',
      label: 'Instances',
      name: 'spec.instances',
      default: 1,
      required: true,
      description: 'Number of PostgreSQL instances to create',
    },
    'CloudnativePG.spec.storage.className': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.storage.className',
      default: 'default',
      required: true,
    },
    'CloudnativePG.spec.storage.size': {
      type: 'text',
      label: 'Storage Size*',
      name: 'spec.storage.size',
      default: '1Gi',
      required: true,
      description: 'Size of the storage',
    },
  };

  public env: any[] = [];

  public resourceDefinitions: object = {
    CloudnativePG: {
      apiVersion: 'postgresql.cnpg.io/v1',
      kind: 'Cluster',
      metadata: {
        name: 'cluster-example-full',
      },
      spec: {
        description: 'Kubero generated postgresql cluster',
        imageName: 'ghcr.io/cloudnative-pg/postgresql:17.5',
        instances: 3,
        startDelay: 300,
        stopDelay: 300,
        primaryUpdateStrategy: 'unsupervised',
        /*
        postgresql: {
          parameters: {
            shared_buffers: "256MB",
            pg_stat_statements: {
              max: "10000",
              track: "all"
            },
            auto_explain: {
              log_min_duration: "10s"
            }
          },
          pg_hba: [
            "host all all 10.244.0.0/16 md5"
          ]
        },
        */
        bootstrap: {
          initdb: {
            database: 'app',
            owner: 'app',
            secret: {
              name: 'cluster-app-user',
            },
          },
        },
        enableSuperuserAccess: true,
        superuserSecret: {
          name: 'cluster-superuser',
        },
        storage: {
          storageClass: 'standard',
          size: '1Gi',
        },
        backup: null,
      },
    },
    superuserSecret: {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: 'cluster-superuser',
      },
      type: 'Opaque',
      stringData: {
        username: 'postgres',
        password: 'changeme',
      },
    },
    appUserSecret: {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: 'cluster-app-user',
      },
      type: 'Opaque',
      stringData: {
        username: 'app',
        password: 'app',
      },
    },
  };

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
