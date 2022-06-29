import { IAddon, IAddonFormFields } from '../addons';

export class RedisCluster implements IAddon {
    public id: string = 'redis-cluster';
    public operator = 'redis-operator';
    public enabled = false;
    public name: string = 'Redis Cluster';
    public icon: string = 'redis.png';
    public plural: string = 'redisclusters';
    public version: string = 'v0.9.0';
    public description: string = 'TBD';

    public formfields: {[key: string]: IAddonFormFields} = {
        name:{
            type: 'text',
            label: 'Redis Cluster Name',
            name: 'name',
            required: true,
            default: 'redis-cluster',
            description: 'The name of the Redis cluster'
        },
        clusterSize:{
            type: 'text',
            label: 'Clustersize',
            name: 'clusterSize',
            default: 3,
            required: true,
            description: 'Number of Redis nodes in the cluster'
        },
        'redisExporter.enabled':{
            type: 'switch',
            label: 'Exporter enabled',
            name: 'redisExporter.enabled',
            default: true,
            required: true
        },
        'kubernetesConfig.resources.limits.cpu': {
            type: 'text',
            label: 'CPU Limit',
            name: 'kubernetesConfig.resources.limits.cpu',
            default: '101m',
            required: true
        },
        'kubernetesConfig.resources.limits.memory': {
            type: 'text',
            label:'Memory Limit',
            name: 'kubernetesConfig.resources.limits.memory',
            default: '128Mi',
            required: true
        },
        'kubernetesConfig.resources.requests.cpu': {
            type: 'text',
            label: 'CPU Requests',
            name: 'kubernetesConfig.resources.requests.cpu',
            default: '101m',
            required: true
        },
        'kubernetesConfig.resources.requests.memory': {
            type: 'text',
            label: 'Memory Requests',
            name: 'kubernetesConfig.resources.requests.memory',
            default: '128Mi',
            required: true
        },
        'storage.volumeClaimTemplate.sepc.resources.requests.storage': {
            type: 'text',
            label: 'Storage Size',
            name: 'storage.volumeClaimTemplate.sepc.resources.requests.storage',
            default: '1Gi',
            required: true
        }
    };

    public crd = {
        apiVersion: 'redis.redis.opstreelabs.in/v1beta1',
        kind: 'RedisCluster',
        metadata: {
            name: this.formfields['name'].default as string || 'redis-cluster'
        },
        spec: {
            clusterSize: this.formfields['clusterSize'].default as number || 3,
            kubernetesConfig: {
                image: 'quay.io/opstree/redis:v6.2.5',
                imagePullPolicy: 'IfNotPresent',
                resources: {
                    limits: {
                        cpu: this.formfields['kubernetesConfig.resources.limits.cpu'].default as string || '101m',
                        memory: this.formfields['kubernetesConfig.resources.limits.memory'].default as string || '128Mi',
                    },
                    requests: {
                        cpu: this.formfields['kubernetesConfig.resources.requests.cpu'].default as string || '101m',
                        memory: this.formfields['kubernetesConfig.resources.requests.memory'].default as string || '128Mi'
                    }
                }
            },
            redisExporter: {
                enabled: this.formfields['redisExporter.enabled'].default as boolean || false,
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
                                storage: this.formfields['storage.volumeClaimTemplate.sepc.resources.requests.storage'].default as string || '1Gi'
                            }
                        }
                    }
                }
            }
        }
    }
    env: [] = [];
}



export class Redis implements IAddon {
    public id: string = 'redis-standalone';
    public operator = 'redis-operator';
    public enabled = false;
    public name: string = 'Redis';
    public icon: string = 'redis.png';
    public plural: string = 'redisclusters';
    public version: string = 'v0.9.0';
    public description: string = 'TBD';

    public formfields: {[key: string]: IAddonFormFields} = {
        name:{
            type: 'text',
            label: 'Redis Cluster Name',
            name: 'name',
            required: true,
            default: 'redis-cluster',
            description: 'The name of the Redis cluster'
        },
        'redisExporter.enabled':{
            type: 'switch',
            label: 'Exporter enabled',
            name: 'redisExporter.enabled',
            default: true,
            required: true
        },
        'kubernetesConfig.resources.limits.cpu': {
            type: 'text',
            label: 'CPU Limit',
            name: 'kubernetesConfig.resources.limits.cpu',
            default: '101m',
            required: true
        },
        'kubernetesConfig.resources.limits.memory': {
            type: 'text',
            label:'Memory Limit',
            name: 'kubernetesConfig.resources.limits.memory',
            default: '128Mi',
            required: true
        },
        'kubernetesConfig.resources.requests.cpu': {
            type: 'text',
            label: 'CPU Requests',
            name: 'kubernetesConfig.resources.requests.cpu',
            default: '101m',
            required: true
        },
        'kubernetesConfig.resources.requests.memory': {
            type: 'text',
            label: 'Memory Requests',
            name: 'kubernetesConfig.resources.requests.memory',
            default: '128Mi',
            required: true
        },
        'storage.volumeClaimTemplate.sepc.resources.requests.storage': {
            type: 'text',
            label: 'Storage Size',
            name: 'storage.volumeClaimTemplate.sepc.resources.requests.storage',
            default: '1Gi',
            required: true
        }
    };

    // https://www.convertsimple.com/convert-yaml-to-javascript-object/
    public crd = {
        apiVersion: 'redis.redis.opstreelabs.in/v1beta1',
        kind: 'Redis',
        metadata: {
            name: this.formfields['name'].default as string || 'redis-standalone'
        },
        spec: {
            clusterSize: 3,
            kubernetesConfig: {
                image: 'quay.io/opstree/redis:v6.2.5',
                imagePullPolicy: 'IfNotPresent',
                resources: {
                    limits: {
                        cpu: this.formfields['kubernetesConfig.resources.limits.cpu'].default as string || '101m',
                        memory: this.formfields['kubernetesConfig.resources.limits.memory'].default as string || '128Mi',
                    },
                    requests: {
                        cpu: this.formfields['kubernetesConfig.resources.requests.cpu'].default as string || '101m',
                        memory: this.formfields['kubernetesConfig.resources.requests.memory'].default as string || '128Mi'
                    }
                },
                serviceType: 'ClusterIP'
            },
            redisExporter: {
                enabled: this.formfields['redisExporter.enabled'].default as boolean || false,
                image: 'quay.io/opstree/redis-exporter:1.0'
            },
            storage: {
                volumeClaimTemplate: {
                    spec: {
                        accessModes: [
                            'ReadWriteOnce'
                        ],
                        resources: {
                            requests: {
                                storage: this.formfields['storage.volumeClaimTemplate.sepc.resources.requests.storage'].default as string || '1Gi'
                            }
                        }
                    }
                }
            }
        }
    }
    env: [] = [];
}