import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class ClickHouseInstallation extends Plugin implements IPlugin {
  public id: string = 'clickhouse-operator'; //same as operator name
  public displayName = 'ClickHouse Cluster';
  public icon = '/img/addons/clickhouse.svg';
  public install =
    'curl -s https://raw.githubusercontent.com/Altinity/clickhouse-operator/master/deploy/operator-web-installer/clickhouse-operator-install.sh | OPERATOR_NAMESPACE=clickhouse-operator-system bash';
  public url = 'https://github.com/Altinity/clickhouse-operator/';
  public description: string =
    'ClickHouse is an open source column-oriented database management system capable of real time generation of analytical data reports. Check ClickHouse documentation for more complete details.';
  public links = [
    {
      name: 'Altinity',
      url: 'https://altinity.com/',
    },
    {
      name: 'Operator homepage',
      url: 'https://www.altinity.com/kubernetes-operator',
    },
    {
      name: 'Documentation',
      url: 'https://github.com/Altinity/clickhouse-operator/tree/master/docs',
    },
    {
      name: 'Quick Start Guide',
      url: 'https://github.com/Altinity/clickhouse-operator/blob/master/docs/quick_start.md',
    },
  ];
  public maintainers = [
    {
      name: 'Altinity',
      email: 'support@altinity.com',
      url: 'https://altinity.com',
      github: 'altinity',
    },
  ];
  public artifact_url =
    'https://artifacthub.io/api/v1/packages/olm/community-operators/clickhouse';
  public beta: boolean = true;

  public formfields: { [key: string]: IPluginFormFields } = {
    'ClickHouseInstallation.metadata.name': {
      type: 'text',
      label: 'Name *',
      name: 'metadata.name',
      required: true,
      default: 'clickhouse',
      description: 'The name of the Clickhouse instance',
    },
    'ClickHouseInstallation.spec.configuration.clusters[0].layout.shardsCount':
      {
        type: 'number',
        label: 'Shards Count *',
        name: 'spec.configuration.clusters[0].layout.shardsCount',
        default: 1,
        required: true,
        description: 'Number of shards',
      },
    'ClickHouseInstallation.spec.configuration.clusters[0].layout.replicasCount':
      {
        type: 'number',
        label: 'Replicas Count *',
        name: 'spec.configuration.clusters[0].layout.replicasCount',
        default: 1,
        required: true,
        description: 'Number of replicas',
      },
    "ClickHouseInstallation.spec.configuration.users['admin/password']": {
      type: 'text',
      label: 'Admin Password *',
      name: "ClickHouseInstallation.spec.configuration.users['admin/password']",
      default: 'ChangeMe',
      required: true,
      description: 'Password for user "user"',
    },
    "ClickHouseInstallation.spec.configuration.users['admin/networks/ip'][0]": {
      type: 'text',
      label: 'Admin Access Network *',
      name: "ClickHouseInstallation.spec.configuration.users['admin/networks/ip'][0]",
      default: '0.0.0.0/0',
      required: true,
      description: 'Allowed Network access for "admin"',
    },
    "ClickHouseInstallation.spec.configuration.users['user/password']": {
      type: 'text',
      label: 'User Password *',
      name: "ClickHouseInstallation.spec.configuration.users['user/password']",
      default: 'ChangeMe',
      required: true,
      description: 'Password for user "user"',
    },
    "ClickHouseInstallation.spec.configuration.users['user/networks/ip'][0]": {
      type: 'text',
      label: 'User Access Network *',
      name: "ClickHouseInstallation.spec.configuration.users['user/networks/ip'][0]",
      default: '0.0.0.0/0',
      required: true,
      description: 'Allowed Network access for "user"',
    },
    'ClickHouseInstallation.spec.templates.volumeClaimTemplates[0].spec.resources.requests.storage':
      {
        type: 'text',
        label: 'Data Storage Size*',
        name: 'ClickHouseInstallation.spec.templates.volumeClaimTemplates[0].spec.resources.requests.storage',
        default: '1Gi',
        required: true,
        description: 'Size of the data storage',
      },
    'ClickHouseInstallation.spec.templates.volumeClaimTemplates[1].spec.resources.requests.storage':
      {
        type: 'text',
        label: 'Log Storage Size*',
        name: 'ClickHouseInstallation.spec.templates.volumeClaimTemplates[0].spec.resources.requests.storage',
        default: '1Gi',
        required: true,
        description: 'Size of the log storage',
      },
  };

  public env: any[] = [];

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }

  public resourceDefinitions: any = {
    ClickHouseInstallation: {
      apiVersion: 'clickhouse.altinity.com/v1',
      kind: 'ClickHouseInstallation',
      metadata: {
        name: 'example',
      },
      spec: {
        configuration: {
          users: {
            'user/password': 'user_password',
            'user/networks/ip': ['0.0.0.0/0'],
            'admin/password': 'admin_password',
            'admin/networks/ip': ['0.0.0.0/0'],
          },
          clusters: [
            {
              name: 'example',
              layout: {
                shardsCount: 1,
                replicasCount: 2,
              },
            },
          ],
        },
        templates: {
          volumeClaimTemplates: [
            {
              name: 'data-volume-template',
              spec: {
                accessModes: ['ReadWriteOnce'],
                resources: {
                  requests: {
                    storage: '1Gi',
                  },
                },
              },
            },
            {
              name: 'log-volume-template',
              spec: {
                accessModes: ['ReadWriteOnce'],
                resources: {
                  requests: {
                    storage: '100Mi',
                  },
                },
              },
            },
          ],
        },
      },
    },
  };
}
