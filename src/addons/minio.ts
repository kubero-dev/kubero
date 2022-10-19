import {Plugin, IPlugin, IPluginFormFields} from './plugin';

// Classname must be same as the CRD's Name
export class Minio extends Plugin implements IPlugin {
    public id: string = 'minio-operator';//same as operator name
    public install: string = 'kubectl create -f https://operatorhub.io/install/stable/minio-operator.yaml -n operators'
    public artifact_url = ' https://artifacthub.io/api/v1/packages/olm/community-operators/minio-operator'
    public beta: boolean = true;

    public formfields: {[key: string]: IPluginFormFields} = {
        'Tenant.metadata.name':{
            type: 'text',
            label: 'Minio Cluster Name',
            name: 'metadata.name',
            required: true,
            default: 'storage-lite',
            description: 'The name of the Minio cluster'
        },
        'Tenant.spec.pools[0].servers':{
            type: 'number',
            label: 'Clustersize',
            name: 'Tenant.spec.pools[0].servers',
            default: 4,
            required: true,
            description: 'Number of pool servers'
        },
    };

    public env: any[] = []

    protected additionalResourceDefinitions: Object = {}

    constructor(availableOperators: any) {
        super();
        super.init(availableOperators);
    }

}