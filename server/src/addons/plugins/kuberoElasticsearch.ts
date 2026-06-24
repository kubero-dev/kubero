import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class KuberoElasticsearch extends Plugin implements IPlugin {
  public id: string = 'kubero-operator'; //same as operator name
  public displayName = 'Elasticsearch (Bitnami)';
  public icon = '/img/addons/elasticsearch.svg';
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
    'KuberoElasticsearch.metadata.name': {
      type: 'text',
      label: 'Elasticsearch Index Name',
      name: 'metadata.name',
      required: true,
      default: 'elasticsearch',
      description: 'The name of the elasticsearch instance',
    },
    'KuberoElasticsearch.spec.elasticsearch.image.tag': {
      type: 'combobox',
      label: 'Version/Tag',
      options: ['7', '7.17.26', '8.6.0-debian-11-r0', '8', '8.17.1', 'latest'], // TODO - load this dynamically
      name: 'spec.couchdb.image.tag',
      required: true,
      default: '8.6.0-debian-11-r0',
      description: 'Version of the PostgreSQL image to use',
    },
    'KuberoElasticsearch.spec.elasticsearch.global.storageClass': {
      type: 'select-storageclass',
      label: 'Storage Class',
      // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
      name: 'spec.elasticsearch.global.storageClass',
      default: 'default',
      required: true,
    },
    'KuberoElasticsearch.spec.elasticsearch.security.elasticPassword': {
      type: 'text',
      label: 'User elastic Password*',
      name: 'spec.elasticsearch.security.elasticPassword',
      default: '',
      required: true,
      description: 'Password for the user elastic',
    },
    'KuberoElasticsearch.spec.elasticsearch.master.persistence.size': {
      type: 'text',
      label: 'Master Storage Size*',
      name: 'spec.elasticsearch.master.persistence.size',
      default: '8Gi',
      required: true,
      description: 'Size of the Master storage',
    },
    'KuberoElasticsearch.spec.elasticsearch.master.replicaCount': {
      type: 'number',
      label: 'Master Replica Count*',
      name: 'spec.elasticsearch.master.replicaCount',
      default: 2,
      required: true,
      description: 'ReplicaCount Number of Master Elasticsearch nodes',
    },
    'KuberoElasticsearch.spec.elasticsearch.data.persistence.size': {
      type: 'text',
      label: 'Data Storage Size*',
      name: 'spec.spec.elasticsearch.data.persistence.size',
      default: '8Gi',
      required: true,
      description: 'Size of the Data storage',
    },
    'KuberoElasticsearch.spec.elasticsearch.data.replicaCount': {
      type: 'number',
      label: 'Data Replica Count*',
      name: 'spec.elasticsearch.data.replicaCount',
      default: 2,
      required: true,
      description: 'ReplicaCount Number of Data Elasticsearch nodes',
    },
    'KuberoElasticsearch.spec.elasticsearch.ingest.enabled': {
      type: 'switch',
      label: 'Ingest enabled*',
      name: 'spec.elasticsearch.ingest.enabled',
      default: true,
      required: false,
      description: 'Ingest enabled',
    },
    'KuberoElasticsearch.spec.elasticsearch.ingest.replicaCount': {
      type: 'number',
      label: 'Ingest Replica Count*',
      name: 'spec.elasticsearch.ingest.replicaCount',
      default: 2,
      required: true,
      description: 'ReplicaCount Number of Data Elasticsearch nodes',
    },
  };

  public env: any[] = [];

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
