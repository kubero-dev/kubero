import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class Elasticsearch extends Plugin implements IPlugin {
  public id: string = 'Elasticsearch'; //same as operator name
  public displayName = 'Elasticsearch';
  public description: string =
    'Elasticsearch is a distributed, RESTful search and analytics engine capable of addressing a growing number of use cases.';
  public icon = '/img/addons/elasticsearch.svg';
  public install: string =
    'kubectl create -f https://download.elastic.co/downloads/eck/3.1.0/crds.yaml && kubectl apply -f https://download.elastic.co/downloads/eck/3.1.0/operator.yaml';
  public url =
    'https://artifacthub.io/packages/olm/community-operators/elastic-cloud-eck';
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
    'Elasticsearch.metadata.name': {
      type: 'text',
      label: 'Elasticsearch Instance Name',
      name: 'metadata.name',
      required: true,
      default: 'elasticsearch',
      description: 'The name of the Elasticsearch instance',
    },
    'Elasticsearch.spec.version': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['9.1.0'], // TODO - load this dynamically
      name: 'spec.version',
      required: true,
      default: '9.1.0',
      description: 'Version of the Elasticsearch version to use',
    },
    'Elasticsearch.spec.nodeSets[0].count': {
      type: 'number',
      label: 'Master Instances',
      name: 'spec.nodeSets[0].count',
      default: 3,
      required: true,
      description: 'Number of Elasticsearch instances to create',
    },
    'Elasticsearch.spec.nodeSets[0].volumeClaimTemplates[0].spec.storageClassName':
      {
        type: 'select-storageclass',
        label: 'Master Storage Class',
        // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
        name: 'spec.nodeSets[0].volumeClaimTemplates[0].spec.storageClassName',
        default: 'default',
        required: true,
      },
    'Elasticsearch.spec.nodeSets[0].volumeClaimTemplates[0].spec.resources.requests.storage':
      {
        type: 'text',
        label: 'Master Storage Size*',
        name: 'spec.nodeSets[0].volumeClaimTemplates[0].spec.resources.requests.storage',
        default: '10Gi',
        required: true,
        description: 'Size of the storage',
      },
    'Elasticsearch.spec.nodeSets[1].count': {
      type: 'number',
      label: 'Data Node Instances',
      name: 'spec.nodeSets[1].count',
      default: 3,
      required: true,
      description: 'Number of Elasticsearch instances to create',
    },
    'Elasticsearch.spec.nodeSets[1].volumeClaimTemplates[0].spec.storageClassName':
      {
        type: 'select-storageclass',
        label: 'Data Node Storage Class',
        // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
        name: 'spec.nodeSets[1].volumeClaimTemplates[0].spec.storageClassName',
        default: 'default',
        required: true,
      },
    'Elasticsearch.spec.nodeSets[1].volumeClaimTemplates[0].spec.resources.requests.storage':
      {
        type: 'text',
        label: 'Data Node Storage Size*',
        name: 'spec.nodeSets[1].volumeClaimTemplates[0].spec.resources.requests.storage',
        default: '10Gi',
        required: true,
        description: 'Size of the storage',
      },
  };

  public env: any[] = [];

  // https://www.elastic.co/docs/deploy-manage/deploy/cloud-on-k8s/nodes-orchestration
  public resourceDefinitions: object = {
    Elasticsearch: {
      apiVersion: 'elasticsearch.k8s.elastic.co/v1',
      kind: 'Elasticsearch',
      metadata: {
        name: 'elasticsearch-sample',
      },
      spec: {
        version: '9.1.0',
        nodeSets: [
          {
            name: 'master-nodes',
            count: 3,
            config: {
              node: {
                roles: ['master'],
                attr: {
                  attr_name: 'attr_value',
                },
                store: {
                  allow_mmap: false,
                },
              },
            },
            podTemplate: {
              spec: {
                containers: [
                  {
                    name: 'elasticsearch',
                    resources: {
                      requests: {
                        memory: '4Gi',
                        cpu: 1,
                      },
                      limits: {
                        memory: '4Gi',
                        cpu: 2,
                      },
                    },
                  },
                ],
              },
            },
            volumeClaimTemplates: [
              {
                metadata: {
                  name: 'elasticsearch-data',
                },
                spec: {
                  accessModes: ['ReadWriteOnce'],
                  resources: {
                    requests: {
                      storage: '8Gi',
                    },
                  },
                  storageClassName: 'default',
                },
              },
            ],
          },
          {
            name: 'data-nodes',
            count: 3,
            config: {
              node: {
                roles: ['data', 'ingest', 'ml'],
                attr: {
                  attr_name: 'attr_value',
                },
                store: {
                  allow_mmap: false,
                },
              },
            },
            podTemplate: {
              spec: {
                containers: [
                  {
                    name: 'elasticsearch',
                    resources: {
                      requests: {
                        memory: '4Gi',
                        cpu: 1,
                      },
                      limits: {
                        memory: '4Gi',
                        cpu: 2,
                      },
                    },
                  },
                ],
              },
            },
            volumeClaimTemplates: [
              {
                metadata: {
                  name: 'elasticsearch-data',
                },
                spec: {
                  accessModes: ['ReadWriteOnce'],
                  resources: {
                    requests: {
                      storage: '8Gi',
                    },
                  },
                  storageClassName: 'default',
                },
              },
            ],
          },
        ],
      },
    },
  };

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
