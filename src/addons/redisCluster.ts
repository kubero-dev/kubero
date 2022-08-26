import {Plugin, IPlugin, IPluginFormFields} from './plugin';

// Classname must be same as the CRD's Name
export class RedisCluster extends Plugin implements IPlugin {
    public id: string = 'redis-operator';//same as operator name
    public install: string = 'kubectl create -f https://operatorhub.io/install/stable/redis-operator.yaml'
    public artifact_url = 'https://artifacthub.io/api/v1/packages/olm/community-operators/redis-operator'

    public formfields: {[key: string]: IPluginFormFields} = {
        'metadata.name':{
            type: 'text',
            label: 'Redis Cluster Name',
            name: 'metadata.name',
            required: true,
            default: 'redis-cluster',
            description: 'The name of the Redis cluster'
        },
        'spec.clusterSize':{
            type: 'number',
            label: 'Clustersize',
            name: 'spec.clusterSize',
            default: 3,
            required: true,
            description: 'Number of Redis nodes in the cluster'
        },
        'spec.redisExporter.enabled':{
            type: 'switch',
            label: 'Exporter enabled',
            name: 'spec.redisExporter.enabled',
            default: true,
            required: true
        },
        'spec.kubernetesConfig.resources.limits.cpu': {
            type: 'text',
            label: 'CPU Limit',
            name: 'spec.kubernetesConfig.resources.limits.cpu',
            default: '101m',
            required: true
        },
        'spec.kubernetesConfig.resources.limits.memory': {
            type: 'text',
            label:'Memory Limit',
            name: 'spec.kubernetesConfig.resources.limits.memory',
            default: '128Mi',
            required: true
        },
        'spec.kubernetesConfig.resources.requests.cpu': {
            type: 'text',
            label: 'CPU Requests',
            name: 'spec.kubernetesConfig.resources.requests.cpu',
            default: '101m',
            required: true
        },
        'spec.kubernetesConfig.resources.requests.memory': {
            type: 'text',
            label: 'Memory Requests',
            name: 'spec.kubernetesConfig.resources.requests.memory',
            default: '128Mi',
            required: true
        },
        'spec.storage.volumeClaimTemplate.sepc.resources.requests.storage': {
            type: 'text',
            label: 'Storage Size',
            name: 'spec.storage.volumeClaimTemplate.sepc.resources.requests.storage',
            default: '1Gi',
            required: true
        }
    };
    
    public env: any[] = []

    constructor(availableOperators: any) {
        super();
        super.init(availableOperators);
    }

}