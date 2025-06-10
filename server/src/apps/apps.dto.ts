import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

@ApiExtraModels()
class GetAppMetadataDTO {
  @ApiProperty()
  creationTimestamp: string;
  @ApiProperty()
  finalizers: Array<string>;
  @ApiProperty()
  generation: number;
  @ApiProperty()
  labels: {
    manager: string;
  };
  @ApiProperty()
  managedFields: Array<{}>;
  @ApiProperty()
  name: string;
  @ApiProperty()
  namespace: string;
  @ApiProperty()
  resourceVersion: string;
  @ApiProperty()
  uid: string;
}

export class GetAppDTO {
  @ApiProperty()
  apiVersion: string;
  @ApiProperty()
  kind: string;
  @ApiProperty({
    type: GetAppMetadataDTO,
    isArray: false,
  })
  metadata: GetAppMetadataDTO;
  @ApiProperty()
  spec: {
    addons: Array<any>;
    affinity: {};
    autodeploy: boolean;
    autoscale: boolean;
    autoscaling: {
      enabled: boolean;
    };
    basicAuth: {
      accounts: Array<any>;
      enabled: boolean;
      realm: string;
    };
    branch: string;
    buildstrategy: string;
    cronjobs: Array<any>;
    deploymentstrategy: string;
    envVars: Array<{
      name: string;
      value: string;
    }>;
    extraVolumes: Array<any>;
    fullnameOverride: string;
    gitrepo: {
      admin: boolean;
      clone_url: string;
      default_branch: string;
      description: string;
      homepage: string;
      id: number;
      language: string;
      name: string;
      node_id: string;
      owner: string;
      private: boolean;
      push: boolean;
      ssh_url: string;
      visibility: string;
    };
    healthcheck: {
      enabled: boolean;
      path: string;
      periodSeconds: number;
      startupSeconds: number;
      timeoutSeconds: number;
    };
    image: {
      build: {
        command: string;
        readOnlyAppStorage: boolean;
        repository: string;
        securityContext: {
          allowPrivilegeEscalation: boolean;
          capabilities: {
            add: Array<any>;
            drop: Array<any>;
          };
          readOnlyRootFilesystem: boolean;
          runAsGroup: number;
          runAsNonRoot: boolean;
          runAsUser: number;
        };
        tag: string;
      };
      command: Array<any>;
      containerPort: number;
      fetch: {
        readOnlyAppStorage: boolean;
        repository: string;
        securityContext: {
          allowPrivilegeEscalation: boolean;
          capabilities: {
            add: Array<any>;
            drop: Array<any>;
          };
          readOnlyRootFilesystem: boolean;
          runAsGroup: number;
          runAsNonRoot: boolean;
          runAsUser: number;
        };
        tag: string;
      };
      pullPolicy: string;
      repository: string;
      run: {
        command: string;
        readOnlyAppStorage: boolean;
        repository: string;
        securityContext: {
          allowPrivilegeEscalation: boolean;
          capabilities: {
            add: Array<any>;
            drop: Array<any>;
          };
          readOnlyRootFilesystem: boolean;
          runAsGroup: number;
          runAsNonRoot: boolean;
          runAsUser: number;
        };
        tag: string;
      };
      tag: string;
    };
    imagePullSecrets: Array<any>;
    ingress: {
      annotations: {
        'cert-manager.io/cluster-issuer': string;
        'kubernetes.io/tls-acme': string;
        'nginx.ingress.kubernetes.io/force-ssl-redirect': string;
      };
      className: string;
      enabled: boolean;
      hosts: Array<{
        host: string;
        paths: Array<{
          path: string;
          pathType: string;
        }>;
      }>;
      tls: Array<{
        hosts: Array<any>;
        secretName: string;
      }>;
    };
    name: string;
    nameOverride: string;
    nodeSelector: {};
    phase: string;
    pipeline: string;
    podAnnotations: {};
    podSecurityContext: {};
    podsize: {
      default: boolean;
      description: string;
      name: string;
      resources: {
        limits: {
          cpu: string;
          memory: string;
        };
        requests: {
          cpu: string;
          memory: string;
        };
      };
    };
    replicaCount: number;
    resources: {
      limits: {
        cpu: string;
        memory: string;
      };
      requests: {
        cpu: string;
        memory: string;
      };
    };
    restartedAt: {
      restartedAt: string;
    };
    service: {
      port: number;
      type: string;
    };
    serviceAccount: {
      annotations: {};
    };
    sleep: string;
    tolerations: Array<any>;
    vulnerabilityscan: {
      enabled: boolean;
      image: {
        repository: string;
        tag: string;
      };
      schedule: string;
    };
    web: {
      autoscaling: {
        maxReplicas: number;
        minReplicas: number;
        targetCPUUtilizationPercentage: number;
        targetMemoryUtilizationPercentage: number;
      };
      replicaCount: number;
    };
    worker: {
      autoscaling: {
        maxReplicas: number;
        minReplicas: number;
        targetCPUUtilizationPercentage: number;
        targetMemoryUtilizationPercentage: number;
      };
      replicaCount: number;
    };
  };
  @ApiProperty()
  status: {
    conditions: Array<{
      lastTransitionTime: string;
      status: string;
      type: string;
      message?: string;
      reason?: string;
    }>;
  };
}
