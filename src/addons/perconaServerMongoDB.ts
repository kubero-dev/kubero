import {Plugin, IPlugin, IPluginFormFields} from './plugin';

// Classname must be same as the CRD's Name
export class PerconaServerMongoDB extends Plugin implements IPlugin {
    public id: string = 'percona-server-mongodb-operator';//same as operator name
    public install: string = 'kubectl create -f https://operatorhub.io/install/stable/percona-server-mongodb-operator.yaml'
    public artifact_url = 'https://artifacthub.io/api/v1/packages/olm/community-operators/percona-server-mongodb-operator'

    public formfields: {[key: string]: IPluginFormFields} = {
        'metadata.name':{
            type: 'text',
            label: 'MongoDB Cluster Name',
            name: 'metadata.name',
            required: true,
            default: 'mongodb-cluster',
            description: 'The name of the MongoDB cluster'
        },
    };
    
    public env: any[] = []

    constructor(availableOperators: any) {
        super();
        super.init(availableOperators);
    }

}