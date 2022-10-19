import {Plugin, IPlugin, IPluginFormFields} from './plugin';

// Classname must be same as the CRD's Name
export class MongoDBCluster extends Plugin implements IPlugin {
    public id: string = 'mongodb-operator';//same as operator name
    public install: string = 'kubectl create -f https://operatorhub.io/install/mongodb-operator.yaml'
    public artifact_url = 'https://artifacthub.io/packages/olm/community-operators/mongodb-operator'
    public beta: boolean = true;

    public formfields: {[key: string]: IPluginFormFields} = {
        'MongoDBCluster.metadata.name':{
            type: 'text',
            label: 'MongoDB Cluster Name',
            name: 'metadata.name',
            required: true,
            default: 'mongodb-cluster',
            description: 'The name of the MongoDB cluster'
        },
        'MongoDBCluster.spec.clusterSize':{
            type: 'number',
            label: 'Clustersize',
            name: 'spec.clusterSize',
            default: 3,
            required: true,
            description: 'Number of Replicasets MongoDB instances in the cluster'
        },
        'MongoDBCluster.spec.storage.storageSize':{
            type: 'text',
            label: 'Sorage Size',
            name: 'spec.storage.storageSize',
            default: '1Gi',
            required: true,
            description: 'Size of the storage'
        },
    };

    public env: any[] = []

    protected additionalResourceDefinitions: Object = {}

    constructor(availableOperators: any) {
        super();
        super.init(availableOperators);
    }

}