import { Plugin } from './plugin';
import { IPlugin, IPluginFormFields } from './plugin.interface';

// Classname must be same as the CRD's Name
export class Tenant extends Plugin implements IPlugin {
  public id: string = 'minio-operator'; //same as operator name
  public displayName = 'Minio';
  public icon = '/img/addons/Minio.png';
  public install: string =
    'kubectl apply -k "github.com/minio/operator?ref=v5.0.18"';
  public installOLM: string =
    'kubectl create -f https://operatorhub.io/install/stable/minio-operator.yaml -n operators';
  public url =
    'https://artifacthub.io/packages/olm/community-operators/minio-operator';
  public docs = [
    {
      title: 'Kubero Docs',
      url: '',
    },
  ];
  public artifact_url =
    'https://artifacthub.io/api/v1/packages/olm/community-operators/minio-operator';
  public beta: boolean = true;

  public formfields: { [key: string]: IPluginFormFields } = {
    'Tenant.metadata.name': {
      type: 'text',
      label: 'Minio Cluster Name',
      name: 'metadata.name',
      required: true,
      default: 'storage-lite',
      description: 'The name of the Minio cluster',
    },
    'Tenant.spec.pools[0].servers': {
      type: 'number',
      label: 'Clustersize',
      name: 'Tenant.spec.pools[0].servers',
      default: 4,
      required: true,
      description: 'Number of pool servers',
    },
  };

  public env: any[] = [];

  protected additionalResourceDefinitions: object = {
    // TODO requires to deploy some secrets
    /*
        E1019 13:11:37.950072       1 main-controller.go:584] error syncing 'another-production/storage-lite': secrets "storage-configuration" not found
        2022/10/19 13:11:38 http: TLS handshake error from 10.244.0.1:57646: remote error: tls: bad certificate
        */

    Tenant: {
      apiVersion: 'minio.min.io/v2',
      kind: 'Tenant',
      metadata: {
        annotations: {
          'prometheus.io/path': '/minio/v2/metrics/cluster',
          'prometheus.io/port': '9000',
          'prometheus.io/scrape': 'true',
        },
        labels: {
          app: 'minio',
        },
        name: 'storage-lite',
      },
      spec: {
        certConfig: {},
        configuration: {
          name: 'storage-configuration',
        },
        env: [],
        externalCaCertSecret: [],
        externalCertSecret: [],
        externalClientCertSecrets: [],
        features: {
          bucketDNS: false,
          domains: {},
        },
        image:
          'quay.io/minio/minio@sha256:c3d20bc2ea08477248c15f932822f932b092b658c5692a9c9f4d88abcf556ed7',
        imagePullSecret: {},
        log: {
          affinity: {
            nodeAffinity: {},
            podAffinity: {},
            podAntiAffinity: {},
          },
          annotations: {},
          audit: {
            diskCapacityGB: 1,
          },
          db: {
            affinity: {
              nodeAffinity: {},
              podAffinity: {},
              podAntiAffinity: {},
            },
            annotations: {},
            env: [],
            image: '',
            initimage: '',
            labels: {},
            nodeSelector: {},
            resources: {},
            securityContext: {
              fsGroup: 999,
              runAsGroup: 999,
              runAsNonRoot: true,
              runAsUser: 999,
            },
            serviceAccountName: '',
            tolerations: [],
            volumeClaimTemplate: {
              metadata: {},
              spec: {
                accessModes: ['ReadWriteOnce'],
                resources: {
                  requests: {
                    storage: '1Gi',
                  },
                },
                storageClassName: 'standard',
              },
            },
          },
          env: [],
          image: '',
          labels: {},
          nodeSelector: {},
          resources: {},
          securityContext: {
            fsGroup: 1000,
            runAsGroup: 1000,
            runAsNonRoot: true,
            runAsUser: 1000,
          },
          serviceAccountName: '',
          tolerations: [],
        },
        mountPath: '/export',
        podManagementPolicy: 'Parallel',
        pools: [
          {
            name: 'pool-0',
            servers: 4,
            volumeClaimTemplate: {
              metadata: {
                name: 'data',
              },
              spec: {
                accessModes: ['ReadWriteOnce'],
                resources: {
                  requests: {
                    storage: '2Gi',
                  },
                },
              },
            },
            volumesPerServer: 2,
          },
        ],
        priorityClassName: '',
        prometheus: {
          affinity: {
            nodeAffinity: {},
            podAffinity: {},
            podAntiAffinity: {},
          },
          annotations: {},
          diskCapacityGB: 1,
          env: [],
          image: '',
          initimage: '',
          labels: {},
          nodeSelector: {},
          resources: {},
          securityContext: {
            fsGroup: 1000,
            runAsGroup: 1000,
            runAsNonRoot: true,
            runAsUser: 1000,
          },
          serviceAccountName: '',
          sidecarimage: '',
          storageClassName: 'standard',
        },
        requestAutoCert: true,
        serviceAccountName: '',
        serviceMetadata: {
          consoleServiceAnnotations: {},
          consoleServiceLabels: {},
          minioServiceAnnotations: {},
          minioServiceLabels: {},
        },
        subPath: '',
        users: [
          {
            name: 'storage-user',
          },
        ],
      },
    },
  };

  constructor(availableOperators: any) {
    super();
    super.init(availableOperators);
  }
}
