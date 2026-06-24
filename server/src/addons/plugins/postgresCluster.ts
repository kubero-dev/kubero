import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class PostgresCluster extends Plugin implements IPlugin {
  public id: string = 'postgresoperator'; //same as operator name
  public displayName = 'Crunchy Postgres Cluster';
  public icon = '/img/addons/pgsql.svg';
  public install: string = `kubectl apply -k github.com/CrunchyData/postgres-operator-examples/kustomize/install/namespace/ && 
kubectl apply --server-side -k github.com/CrunchyData/postgres-operator-examples/kustomize/install/default/`;
  public installOLM: string =
    'kubectl create -f https://operatorhub.io/install/v5/postgresql.yaml';
  public url =
    'https://artifacthub.io/packages/olm/community-operators/postgresql';
  public docs = [
    {
      title: 'Kubero Docs',
      url: '',
    },
  ];
  public artifact_url =
    'https://artifacthub.io/api/v1/packages/olm/community-operators/postgresql';
  public beta: boolean = false;

  public formfields: { [key: string]: IPluginFormFields } = {
    'PostgresCluster.metadata.name': {
      type: 'text',
      label: 'Postgres Cluster Name',
      name: 'metadata.name',
      required: true,
      default: 'pg-cluster',
      description: 'The name of the Postgres cluster',
    },
    'PostgresCluster.spec.postgresVersion': {
      type: 'number',
      label: 'Postgres Version',
      name: 'spec.postgresVersion',
      default: 14,
      required: true,
      description: 'Version of the Running Postgresql',
    },
    'PostgresCluster.spec.instances[0].name': {
      type: 'text',
      label: 'Cluster Name',
      name: 'spec.instances[0].name',
      default: 'instance-1',
      required: true,
      description: 'Name of the Instance',
    },
    'PostgresCluster.spec.instances[0].replicas': {
      type: 'number',
      label: 'Clustersize',
      name: 'spec.instances[0].replicas',
      default: 1,
      required: true,
      description: 'Number of Postgres instances in the cluster',
    },
    'PostgresCluster.spec.instances[0].dataVolumeClaimSpec.resources.requests.storage':
      {
        type: 'text',
        label: 'Data Volume size',
        name: 'spec.instances[0].dataVolumeClaimSpec.resources.requests.storage',
        default: '1Gi',
        required: true,
        description: 'Number of Postgres instances in the cluster',
      },
  };

  public env: any[] = [
    {
      name: 'DB_VENDOR',
      value: 'postgres',
    },
    {
      name: 'DB_ADDR',
      valueFrom: {
        secretKeyRef: {
          name: 'hippo-pguser-hippo',
          key: 'host',
        },
      },
    },
    {
      name: 'DB_PORT',
      valueFrom: {
        secretKeyRef: {
          name: 'hippo-pguser-hippo',
          key: 'port',
        },
      },
    },
    {
      name: 'DB_DATABASE',
      valueFrom: {
        secretKeyRef: {
          name: 'hippo-pguser-hippo',
          key: 'dbname',
        },
      },
    },
    {
      name: 'DB_USER',
      valueFrom: {
        secretKeyRef: {
          name: 'hippo-pguser-hippo',
          key: 'user',
        },
      },
    },
    {
      name: 'DB_PASSWORD',
      valueFrom: {
        secretKeyRef: {
          name: 'hippo-pguser-hippo',
          key: 'password',
        },
      },
    },
  ];

  protected additionalResourceDefinitions: object = {
    // override default resource definitions since example is missing "backups" section
    PostgresCluster: {
      apiVersion: 'postgres-operator.crunchydata.com/v1beta1',
      kind: 'PostgresCluster',
      metadata: {
        name: 'hippo',
      },
      spec: {
        image:
          'registry.developers.crunchydata.com/crunchydata/crunchy-postgres:ubi8-14.5-1',
        postgresVersion: 14,
        instances: [
          {
            name: 'instance1',
            dataVolumeClaimSpec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: '1Gi',
                },
              },
            },
          },
        ],
        backups: {
          pgbackrest: {
            image:
              'registry.developers.crunchydata.com/crunchydata/crunchy-pgbackrest:ubi8-2.40-1',
            repos: [
              {
                name: 'repo1',
                volume: {
                  volumeClaimSpec: {
                    accessModes: ['ReadWriteOnce'],
                    resources: {
                      requests: {
                        storage: '1Gi',
                      },
                    },
                  },
                },
              },
              {
                name: 'repo2',
                volume: {
                  volumeClaimSpec: {
                    accessModes: ['ReadWriteOnce'],
                    resources: {
                      requests: {
                        storage: '1Gi',
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        proxy: {
          pgBouncer: {
            image:
              'registry.developers.crunchydata.com/crunchydata/crunchy-pgbouncer:ubi8-1.17-1',
          },
        },
      },
    },
  };

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
