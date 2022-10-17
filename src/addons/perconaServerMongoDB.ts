import {Plugin, IPlugin, IPluginFormFields} from './plugin';

// Classname must be same as the CRD's Name
export class PerconaServerMongoDB extends Plugin implements IPlugin {
    public id: string = 'percona-server-mongodb-operator';//same as operator name
    public install: string = 'kubectl create -f https://operatorhub.io/install/stable/percona-server-mongodb-operator.yaml'
    public artifact_url = 'https://artifacthub.io/api/v1/packages/olm/community-operators/percona-server-mongodb-operator'
    public beta: boolean = true;

    public formfields: {[key: string]: IPluginFormFields} = {
        'metadata.name':{
            type: 'text',
            label: 'MongoDB Cluster Name',
            name: 'metadata.name',
            required: true,
            default: 'mongodb-cluster',
            description: 'The name of the MongoDB cluster'
        },
        'spec.replsets[0].size':{
            type: 'number',
            label: 'Clustersize',
            name: 'spec.replsets[0].size',
            default: 1,
            required: true,
            description: 'Number of Replicasets MongoDB instances in the cluster'
        },
        'spec.replsets[0].expose.enabled':{
            type: 'switch',
            label: 'Expose',
            name: 'spec.replsets[0].expose.enabled',
            default: true,
            required: true,
            description: 'Expose MongoDB cluster replica set'
        },
        'spec.replsets[0].expose.exposeType':{
            type: 'text',
            label: 'Expose Type',
            name: 'spec.replsets[0].expose.exposeType',
            default: 'ClusterIP',
            required: true,
            description: 'Type of the Expose'
        },
    };

    public env: any[] = []

    constructor(availableOperators: any) {
        super();
        super.init(availableOperators);
    }

}