import {Plugin, IPlugin, IPluginFormFields} from './plugin';

// Classname must be same as the CRD's Name
export class PostgresCluster extends Plugin implements IPlugin {
    public id: string = 'postgresoperator';//same as operator name
    public install: string = 'kubectl create -f https://operatorhub.io/install/v5/postgresql.yaml'
    public artifact_url = 'https://artifacthub.io/api/v1/packages/olm/community-operators/postgresql'
    public beta: boolean = true;

    public formfields: {[key: string]: IPluginFormFields} = {
        'metadata.name':{
            type: 'text',
            label: 'Redis Cluster Name',
            name: 'metadata.name',
            required: true,
            default: 'pg-cluster',
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

    constructor(availableOperators: any) {
        super();
        super.init(availableOperators);
    }

}