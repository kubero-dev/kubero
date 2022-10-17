import {Plugin, IPlugin, IPluginFormFields} from './plugin';

// Classname must be same as the CRD's Name
export class MongoDB extends Plugin implements IPlugin {
    public id: string = 'mongodb-operator';//same as operator name
    public install: string = 'kubectl create -f https://operatorhub.io/install/mongodb-operator.yaml'
    public artifact_url = 'https://artifacthub.io/packages/olm/community-operators/mongodb-operator'
    public beta: boolean = true;

    public formfields: {[key: string]: IPluginFormFields} = {
        'metadata.name':{
            type: 'text',
            label: 'MongoDB Name',
            name: 'metadata.name',
            required: true,
            default: 'mongodbinstance',
            description: 'The name of the MongoDB cluster'
        },
        'spec.storage.storageSize':{
            type: 'text',
            label: 'Sorage Size',
            name: 'spec.storage.storageSize',
            default: '1Gi',
            required: true,
            description: 'Size of the storage'
        },
        'spec.storage.storageClass':{
            type: 'text',
            label: 'Sorage Class',
            name: 'spec.storage.storageClass',
            default: 'standard',
            required: true,
            description: 'Classname of the storage'
        },
    };
    
    public env: any[] = []

    constructor(availableOperators: any) {
        super();
        super.init(availableOperators);
    }

}