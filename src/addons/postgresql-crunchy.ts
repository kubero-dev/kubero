import { IAddon, IAddonFormFields } from '../addons';

export class CrunchyPostgresqlCluster implements IAddon {
    public id: string = 'postgresql-cluster';
    public operator = 'postgresql';
    public enabled = false;
    public name: string = 'PostgreSQL';
    public icon: string = 'postgresql.png';
    public plural: string = 'postgresclusters';
    public version: string = 'v5.1.1';
    public description: string = 'TBD';
    public formfields: {[key: string]: IAddonFormFields} = {
      'metadata.name':{
          type: 'text',
          label: 'Redis Cluster Name',
          name: 'metadata.name',
          required: true,
          default: 'redis-cluster',
          description: 'The name of the Redis cluster'
      },
      'spec.postgresVersion':{
          type: 'number',
          label: 'Postgres Version',
          name: 'spec.postgresVersion',
          default: 14,
          required: true,
          description: 'Version of the Running Postgresql'
      },
      'spec.instances[0].name':{
          type: 'text',
          label: 'Cluster Name',
          name: 'spec.instances[0].name',
          default: 'instance-1',
          required: true,
          description: 'Name of the Instance'
      },
      'spec.instances[0].replicas':{
          type: 'number',
          label: 'Clustersize',
          name: 'spec.instances[0].replicas',
          default: 1,
          required: true,
          description: 'Number of Postgres instances in the cluster'
      },
      'spec.instances[0].dataVolumeClaimSpec.resources.requests.storage':{
          type: 'text',
          label: 'Data Volume size',
          name: 'spec.instances[0].dataVolumeClaimSpec.resources.requests.storage',
          default: '1Gi',
          required: true,
          description: 'Number of Postgres instances in the cluster'
      },
    };

    public crd = {
      apiVersion: "postgres-operator.crunchydata.com/v1beta1",
      kind: "PostgresCluster",
      metadata: {
        name: "hippo"
      },
      spec: {
        image: "registry.developers.crunchydata.com/crunchydata/crunchy-postgres:ubi8-14.4-0",
        postgresVersion: 14,
        instances: [
          {
            name: this.formfields['spec.instances[0].name'].default as string || "instance1",
            replicas: 1,
            dataVolumeClaimSpec: {
              accessModes: [
                "ReadWriteMany"
              ],
              resources: {
                requests: {
                  storage: "1Gi"
                }
              }
            }
          }
        ],
        backups: {},
        proxy: {
          pgBouncer: {
            image: "registry.developers.crunchydata.com/crunchydata/crunchy-pgbouncer:ubi8-1.16-4",
            resources: {
              limits: {
                cpu: "200m",
                memory: "128Mi"
              }
            }
          }
        }
      }
    }
    
    public env: any[] = [
      {
        name: "DB_VENDOR",
        value: "postgres"
      },
      {
        name: "DB_ADDR",
        valueFrom: {
          secretKeyRef: {
            name: "hippo-pguser-hippo",
            key: "host"
          }
        }
      },
      {
        name: "DB_PORT",
        valueFrom: {
          secretKeyRef: {
            name: "hippo-pguser-hippo",
            key: "port"
          }
        }
      },
      {
        name: "DB_DATABASE",
        valueFrom: {
          secretKeyRef: {
            name: "hippo-pguser-hippo",
            key: "dbname"
          }
        }
      },
      {
        name: "DB_USER",
        valueFrom: {
          secretKeyRef: {
            name: "hippo-pguser-hippo",
            key: "user"
          }
        }
      },
      {
        name: "DB_PASSWORD",
        valueFrom: {
          secretKeyRef: {
            name: "hippo-pguser-hippo",
            key: "password"
          }
        }
      }
    ]
}