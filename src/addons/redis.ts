import { IAddon, IAddonFormFields } from '../addons';

export class RedisCluster implements IAddon {
    public id: string = 'redis-cluster';
    public name: string = 'Redis Cluster';
    public plural: string = 'redisclusters';
    public version: string;
    public description: string;
    public formfields: IAddonFormFields[] = [
        {
            type: 'string',
            label: 'Redis Cluster Name',
            name: 'name',
            required: true,
            default: 'redis-cluster',
            description: 'The name of the Redis cluster',
        },
        {
            type: 'text',
            label: 'Clustersize',
            name: 'clusterSize',
            default: '3',
            required: true
        },
        {
            type: 'switch',
            label: 'Exporter enabled',
            name: 'redisExporter.enabled',
            default: true,
            required: true
        },
        {
            type: 'text',
            label: 'CPU Limit',
            name: 'kubernetesConfig.resources.limits.cpu',
            default: '101m',
            required: true
        },
        {
            type: 'text',
            label:'Memory Limit',
            name: 'kubernetesConfig.resources.limits.memory',
            default: '128Mi',
            required: true
        },
        {
            type: 'text',
            label: 'CPU Requests',
            name: 'kubernetesConfig.resources.requests.cpu',
            default: '101m',
            required: true
        },
        {
            type: 'text',
            label: 'Memory Requests',
            name: 'kubernetesConfig.resources.requests.memory',
            default: '128Mi',
            required: true
        },
        {
            type: 'text',
            label: 'Storage Size',
            name: 'storage.volumeClaimTemplate.sepc.resources.requests.storage',
            default: '1Gi',
            required: true
        }
    ];

    public crd = {
        apiVersion: 'redis.redis.opstreelabs.in/v1beta1',
        kind: 'RedisCluster',
        metadata: {
            name: 'redis-cluster'
        },
        spec: {
            clusterSize: 3,
            kubernetesConfig: {
                image: 'quay.io/opstree/redis:v6.2.5',
                imagePullPolicy: 'IfNotPresent',
                resources: {
                    limits: {
                        cpu: '101m',
                        memory: '128Mi',
                    },
                    requests: {
                        cpu: '101m',
                        memory: '128Mi'
                    }
                }
            },
            redisExporter: {
                enabled: false,
                image: 'quay.io/opstree/redis-exporter:1.0'
            },
            redisFollower: {
                serviceType: 'ClusterIP'
            },
            redisLeader: {
                serviceType: 'ClusterIP'
            },
            storage: {
                volumeClaimTemplate: {
                    spec: {
                        accessModes: [
                            'ReadWriteOnce'
                        ],
                        resources: {
                            requests: {
                                storage: '1Gi'
                            }
                        }
                    }
                }
            }
        }
    }
    env: [] = [];

    constructor(
        version: string,
        description: string,
    ) {
        this.version = version;
        this.description = description;
    }
}