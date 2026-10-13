import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class RedisCluster extends Plugin implements IPlugin {
  public id: string = 'redis-operator'; //same as operator name
  public displayName = 'Opstree Redis Cluster';
  public icon = '/img/addons/redis.svg';
  public install: string = `kubectl apply -f https://raw.githubusercontent.com/OT-CONTAINER-KIT/redis-operator/master/config/crd/bases/redis.redis.opstreelabs.in_redisclusters.yaml &&
kubectl apply -f https://raw.githubusercontent.com/OT-CONTAINER-KIT/redis-operator/master/config/manager/manager.yaml &&
kubectl apply -f https://raw.githubusercontent.com/OT-CONTAINER-KIT/redis-operator/master/config/rbac/serviceaccount.yaml &&
kubectl apply -f https://raw.githubusercontent.com/OT-CONTAINER-KIT/redis-operator/master/config/rbac/role.yaml &&
kubectl apply -f https://raw.githubusercontent.com/OT-CONTAINER-KIT/redis-operator/master/config/rbac/role_binding.yaml`;
  public installOLM: string =
    'kubectl create -f https://operatorhub.io/install/stable/redis-operator.yaml';
  public url =
    'https://artifacthub.io/packages/olm/community-operators/redis-operator';
  public docs = [
    {
      title: 'Kubero Docs',
      url: '',
    },
  ];
  public artifact_url =
    'https://artifacthub.io/api/v1/packages/olm/community-operators/redis-operator';
  public beta: boolean = true;

  public formfields: { [key: string]: IPluginFormFields } = {
    'RedisCluster.metadata.name': {
      type: 'text',
      label: 'Redis Cluster Name',
      name: 'metadata.name',
      required: true,
      default: 'redis-cluster',
      description: 'The name of the Redis cluster',
    },
    'RedisCluster.spec.clusterSize': {
      type: 'number',
      label: 'Clustersize',
      name: 'spec.clusterSize',
      default: 3,
      required: true,
      description: 'Number of Redis nodes in the cluster',
    },
    'RedisCluster.spec.redisExporter.enabled': {
      type: 'switch',
      label: 'Exporter enabled',
      name: 'spec.redisExporter.enabled',
      default: true,
      required: true,
    },
    'RedisCluster.spec.kubernetesConfig.resources.limits.cpu': {
      type: 'text',
      label: 'CPU Limit',
      name: 'spec.kubernetesConfig.resources.limits.cpu',
      default: '101m',
      required: true,
    },
    'RedisCluster.spec.kubernetesConfig.resources.limits.memory': {
      type: 'text',
      label: 'Memory Limit',
      name: 'spec.kubernetesConfig.resources.limits.memory',
      default: '128Mi',
      required: true,
    },
    'RedisCluster.spec.kubernetesConfig.resources.requests.cpu': {
      type: 'text',
      label: 'CPU Requests',
      name: 'spec.kubernetesConfig.resources.requests.cpu',
      default: '101m',
      required: true,
    },
    'RedisCluster.spec.kubernetesConfig.resources.requests.memory': {
      type: 'text',
      label: 'Memory Requests',
      name: 'spec.kubernetesConfig.resources.requests.memory',
      default: '128Mi',
      required: true,
    },
    'RedisCluster.spec.storage.volumeClaimTemplate.spec.resources.requests.storage':
      {
        type: 'text',
        label: 'Storage Size',
        name: 'spec.storage.volumeClaimTemplate.spec.resources.requests.storage',
        default: '1Gi',
        required: true,
      },
  };

  public env: any[] = [];

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
