import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class Cockroachdb extends Plugin implements IPlugin {
  public id: string = 'Cockroachdb'; //same as operator name
  public displayName = 'CockroachDB';
  public icon = '/img/addons/CockroachDB.svg';
  public install: string =
    'kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/master/install/crds.yaml && ' +
    'kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/master/install/operator.yaml';
  public installOLM: string =
    'kubectl create -f https://operatorhub.io/install/cockroachdb.yaml';
  public url =
    'https://artifacthub.io/packages/olm/community-operators/cockroachdb';
  public docs = [
    {
      title: 'Kubero Docs',
      url: '',
    },
  ];
  public artifact_url =
    'https://artifacthub.io/api/v1/packages/olm/community-operators/cockroachdb';
  public beta: boolean = true;

  public formfields: { [key: string]: IPluginFormFields } = {
    'Cockroachdb.metadata.name': {
      type: 'text',
      label: 'MongoDB Name',
      name: 'MongoDB.metadata.name',
      required: true,
      default: 'mongodbinstance',
      description: 'The name of the MongoDB cluster',
    },
    'Cockroachdb.conf.cache': {
      type: 'text',
      label: 'Cache Size',
      name: 'Cockroachdb.conf.cache',
      required: true,
      default: '25%',
      description: 'Size of the cache',
    },
    'Cockroachdb.conf.max-sql-memory': {
      type: 'text',
      label: 'Max SQL Memory',
      name: 'Cockroachdb.conf.max-sql-memory',
      required: true,
      default: '25%',
      description: 'Max SQL Memory',
    },
    'Cockroachdb.conf.single-node': {
      type: 'switch',
      label: 'Single Node',
      name: 'Cockroachdb.conf.single-node',
      required: false,
      default: false,
      description: 'Single Node',
    },
    'Cockroachdb.statefulset.replicas': {
      type: 'number',
      label: 'Replicas',
      name: 'Cockroachdb.statefulset.replicas',
      required: true,
      default: 3,
      description: 'Number of Replicas',
    },
    'Cockroachdb.spec.storage.persistentVolume.storageSize': {
      type: 'text',
      label: 'Sorage Size',
      name: 'MongoDB.spec.storage.storageSize',
      default: '1Gi',
      required: true,
      description: 'Size of the storage',
    },
    'Cockroachdb.spec.storage.persistentVolume.storageClass': {
      type: 'select-storageclass',
      label: 'Sorage Class',
      name: 'MongoDB.spec.storage.storageClass',
      default: 'standard',
      required: true,
      description: 'Classname of the storage',
    },
  };

  public env: any[] = [];

  protected additionalResourceDefinitions: object = {};

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }

  public resourceDefinitions: any = {
    Cockroachdb: {
      apiVersion: 'charts.operatorhub.io/v1alpha1',
      kind: 'Cockroachdb',
      metadata: {
        name: 'cockroachdbinstance',
      },
      spec: {
        cache: '25%',
        'max-sql-memory': '25%',
        'single-node': false,
        statefulset: {
          replicas: 3,
        },
        storage: {
          persistentVolume: {
            storageSize: '1Gi',
            storageClass: 'standard',
          },
        },
      },
    },
  };
}
