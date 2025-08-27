import { KubernetesService } from './kubernetes.service';

jest.mock('@kubernetes/client-node', () => {
  const actual = jest.requireActual('@kubernetes/client-node');
  return {
    ...actual,
    KubeConfig: jest.fn().mockImplementation(() => ({
      loadFromString: jest.fn(),
      loadFromFile: jest.fn(),
      loadFromCluster: jest.fn(),
      setCurrentContext: jest.fn(),
      getCurrentContext: jest.fn().mockReturnValue('default'),
      getContexts: jest.fn().mockReturnValue([{ name: 'default' }]),
      makeApiClient: jest.fn(() => ({
        getCode: jest
          .fn()
          .mockResolvedValue({ body: { gitVersion: 'v1.20.0' } }),
        listNamespace: jest.fn().mockResolvedValue({ body: { items: [] } }),
        listNamespacedCustomObject: jest
          .fn()
          .mockResolvedValue({ body: { items: [] } }),
        createNamespacedCustomObject: jest.fn().mockResolvedValue({}),
        replaceNamespacedCustomObject: jest.fn().mockResolvedValue({}),
        deleteNamespacedCustomObject: jest.fn().mockResolvedValue({}),
        getNamespacedCustomObject: jest.fn().mockResolvedValue({ body: {} }),
        listClusterCustomObject: jest
          .fn()
          .mockResolvedValue({ body: { items: [] } }),
        listNamespacedPod: jest.fn().mockResolvedValue({ body: { items: [] } }),
        readNamespacedPod: jest.fn().mockResolvedValue({ body: {} }),
        createNamespace: jest.fn().mockResolvedValue({}),
        patchNamespacedCustomObject: jest.fn().mockResolvedValue({}),
        patchNamespacedSecret: jest.fn().mockResolvedValue({}),
        createNamespacedJob: jest.fn().mockResolvedValue({}),
        deleteNamespacedJob: jest.fn().mockResolvedValue({}),
        readNamespacedJob: jest.fn().mockResolvedValue({ body: {} }),
        listNamespacedJob: jest.fn().mockResolvedValue({ body: { items: [] } }),
        listIngressClass: jest.fn().mockResolvedValue({ body: { items: [] } }),
        listIngressForAllNamespaces: jest
          .fn()
          .mockResolvedValue({ body: { items: [] } }),
        listStorageClass: jest.fn().mockResolvedValue({ body: { items: [] } }),
        listNamespacedEvent: jest
          .fn()
          .mockResolvedValue({ body: { items: [] } }),
        createNamespacedEvent: jest.fn().mockResolvedValue({}),
      })),
    })),
    VersionApi: jest.fn(),
    CoreV1Api: jest.fn(),
    AppsV1Api: jest.fn(),
    CustomObjectsApi: jest.fn(),
    StorageV1Api: jest.fn(),
    BatchV1Api: jest.fn(),
    NetworkingV1Api: jest.fn(),
    PatchUtils: jest.fn(),
    Log: jest.fn().mockImplementation(() => ({})),
    Metrics: jest.fn().mockImplementation(() => ({
      getPodMetrics: jest.fn().mockResolvedValue({ items: [] }),
      getNodeMetrics: jest.fn().mockResolvedValue({ items: [] }),
    })),
    V1Pod: jest.fn(),
    CoreV1Event: jest.fn().mockImplementation(() => ({})),
    CoreV1EventList: jest.fn(),
    V1ConfigMap: jest.fn(),
    V1Namespace: jest.fn(),
    V1Job: jest.fn(),
    VersionInfo: jest
      .fn()
      .mockImplementation(() => ({ gitVersion: 'v1.20.0' })),
  };
});

jest.mock('yaml', () => ({
  parse: jest.fn(() => ({})),
}));

describe('KubernetesService', () => {
  let service: KubernetesService;

  beforeEach(() => {
    service = new KubernetesService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should getKubeVersion', () => {
    expect(service.getKubeVersion()).toBeDefined();
  });

  it('should getKubernetesVersion', () => {
    expect(service.getKubernetesVersion()).toBe('v1.20.0');
  });

  it('should getContexts', () => {
    expect(service.getContexts()).toEqual([{ name: 'default' }]);
  });

  it('should getCurrentContext', () => {
    expect(service.getCurrentContext()).toBe('default');
  });

  it('should getNamespaces', async () => {
    const result = await service.getNamespaces();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should getPipelinesList', async () => {
    const result = await service.getPipelinesList();
    expect(result).toHaveProperty('items');
  });

  it('should createPipeline', async () => {
    await expect(
      service.createPipeline({ name: 'test' } as any),
    ).resolves.toBeUndefined();
  });

  it('should updatePipeline', async () => {
    await expect(
      service.updatePipeline({ name: 'test' } as any, '1'),
    ).resolves.toBeUndefined();
  });

  it('should deletePipeline', async () => {
    await expect(service.deletePipeline('test')).resolves.toBeUndefined();
  });

  it('should getPipeline', async () => {
    await expect(service.getPipeline('test')).resolves.toBeDefined();
  });

  it('should createApp', async () => {
    await expect(
      service.createApp(
        { name: 'app', pipeline: 'p', phase: 'ph' } as any,
        'ctx',
      ),
    ).resolves.toBeUndefined();
  });

  it('should updateApp', async () => {
    await expect(
      service.updateApp(
        { name: 'app', pipeline: 'p', phase: 'ph' } as any,
        '1',
        'ctx',
      ),
    ).resolves.toBeUndefined();
  });

  it('should deleteApp', async () => {
    await expect(
      service.deleteApp('p', 'ph', 'app', 'ctx'),
    ).resolves.toBeUndefined();
  });

  it('should getApp', async () => {
    await expect(
      service.getApp('p', 'ph', 'app', 'ctx'),
    ).resolves.toBeDefined();
  });

  it('should getAppsList', async () => {
    await expect(service.getAppsList('ns', 'ctx')).resolves.toHaveProperty(
      'items',
    );
  });

  it('should getAllAppsList', async () => {
    await expect(service.getAllAppsList('ctx')).resolves.toHaveProperty(
      'items',
    );
  });

  it('should restartApp', async () => {
    await expect(
      service.restartApp('p', 'ph', 'app', 'web', 'ctx'),
    ).resolves.toBeUndefined();
  });

  it('should getOperators', async () => {
    await expect(service.getOperators()).resolves.toBeDefined();
  });

  it('should getCustomresources', async () => {
    await expect(service.getCustomresources()).resolves.toBeDefined();
  });

  it('should getPods', async () => {
    await expect(service.getPods('ns', 'ctx')).resolves.toBeDefined();
  });

  it('should createEvent', async () => {
    await expect(
      service.createEvent('Normal', 'reason', 'event', 'msg'),
    ).resolves.toBeUndefined();
  });

  it('should getEvents', async () => {
    await expect(service.getEvents('ns')).resolves.toBeDefined();
  });

  it('should getPodMetrics', async () => {
    await expect(service.getPodMetrics('ns', 'app')).resolves.toBeDefined();
  });

  it('should getNodeMetrics', async () => {
    await expect(service.getNodeMetrics()).resolves.toBeDefined();
  });

  it('should getPodUptimes', async () => {
    const mockPods = {
      body: {
        items: [
          {
            metadata: { name: 'pod1' },
            status: { startTime: new Date(Date.now() - 60000) }, // 1 minute ago
          },
          {
            metadata: { name: 'pod2' },
            status: { startTime: new Date(Date.now() - 3600000) }, // 1 hour ago
          },
          {
            metadata: { name: 'pod3' },
            status: {}, // no startTime
          },
          {
            metadata: {}, // no name
          },
        ],
      },
    };

    // Access the mocked coreV1Api through the service
    const coreV1ApiMock = (service as any).coreV1Api;
    coreV1ApiMock.listNamespacedPod.mockResolvedValue(mockPods);

    const result = await service.getPodUptimes('test-namespace');

    expect(coreV1ApiMock.listNamespacedPod).toHaveBeenCalledWith(
      'test-namespace',
    );
    expect(result).toBeDefined();
    expect(result['pod1']).toBeDefined();
    expect(result['pod1'].ms).toBeGreaterThan(50000); // roughly 1 minute in ms
    expect(result['pod1'].formatted).toBeDefined();
    expect(result['pod2']).toBeDefined();
    expect(result['pod2'].ms).toBeGreaterThan(3500000); // roughly 1 hour in ms
    expect(result['pod2'].formatted).toBeDefined();
    expect(result['pod3']).toBeDefined();
    expect(result['pod3'].ms).toBe(-1);
    expect(result['pod3'].formatted).toBe('');
  });

  describe('getPodUptimeMS', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return -1 when startTime is not provided', () => {
      const pod = {
        status: {},
      };

      const uptime = (service as any).getPodUptimeMS(pod);
      expect(uptime).toBe(-1);
    });

    it('should return -1 when status is not provided', () => {
      const pod = {};

      const uptime = (service as any).getPodUptimeMS(pod);
      expect(uptime).toBe(-1);
    });
  });

  describe('formatUptime', () => {
    it('should return empty string for negative uptime', () => {
      const result = (service as any).formatUptime(-1);
      expect(result).toBe('');
    });

    it('should format seconds for uptime < 120s', () => {
      expect((service as any).formatUptime(5000)).toBe('5s');
      expect((service as any).formatUptime(59000)).toBe('59s');
      expect((service as any).formatUptime(119000)).toBe('119s');
    });

    it('should format minutes and seconds for 2-10 minutes', () => {
      expect((service as any).formatUptime(120000)).toBe('2m');
      expect((service as any).formatUptime(125000)).toBe('2m5s');
      expect((service as any).formatUptime(300000)).toBe('5m');
      expect((service as any).formatUptime(315000)).toBe('5m15s');
      expect((service as any).formatUptime(599000)).toBe('9m59s');
    });

    it('should format only minutes for 10-120 minutes', () => {
      expect((service as any).formatUptime(600000)).toBe('10m');
      expect((service as any).formatUptime(1800000)).toBe('30m');
      expect((service as any).formatUptime(7199000)).toBe('119m');
    });

    it('should format hours and minutes for 2-48 hours', () => {
      expect((service as any).formatUptime(7200000)).toBe('2h');
      expect((service as any).formatUptime(7500000)).toBe('2h5m');
      expect((service as any).formatUptime(86400000)).toBe('24h');
      expect((service as any).formatUptime(90000000)).toBe('25h');
      expect((service as any).formatUptime(172799000)).toBe('47h59m');
    });

    it('should format days and hours for longer periods', () => {
      expect((service as any).formatUptime(172800000)).toBe('2d');
      expect((service as any).formatUptime(176400000)).toBe('2d1h');
      expect((service as any).formatUptime(259200000)).toBe('3d');
      expect((service as any).formatUptime(694800000)).toBe('8d1h');
      expect((service as any).formatUptime(2592000000)).toBe('30d');
    });
  });

  it('should getStorageClasses', async () => {
    await expect(service.getStorageClasses()).resolves.toBeDefined();
  });

  it('should getIngressClasses', async () => {
    await expect(service.getIngressClasses()).resolves.toBeDefined();
  });

  it('should getAllIngress', async () => {
    await expect(service.getAllIngress()).resolves.toBeDefined();
  });

  it('should getDomains', async () => {
    await expect(service.getDomains()).resolves.toBeDefined();
  });

  it('should execInContainer', async () => {
    const ws = { readyState: 1 };
    service['exec'] = { exec: jest.fn().mockResolvedValue(ws) } as any;
    const result = await service.execInContainer(
      'ns',
      'pod',
      'container',
      'ls',
      {} as any,
    );
    expect(result).toBe(ws);
  });

  it('should getKuberoConfig', async () => {
    await expect(service.getKuberoConfig('ns')).resolves.toBeDefined();
  });

  it('should updateKuberoConfig', async () => {
    await expect(
      service.updateKuberoConfig('ns', { spec: {} }),
    ).resolves.toBeUndefined();
  });

  it('should updateKuberoSecret', async () => {
    await expect(
      service.updateKuberoSecret('ns', { key: 'value' }),
    ).resolves.toBeUndefined();
  });

  it('should deleteKuberoBuildJob', async () => {
    await expect(
      service.deleteKuberoBuildJob('ns', 'build'),
    ).resolves.toBeUndefined();
  });

  it('should getJob', async () => {
    await expect(service.getJob('ns', 'job')).resolves.toBeDefined();
  });

  it('should getJobs', async () => {
    await expect(service.getJobs('ns')).resolves.toBeDefined();
  });

  it('should validateKubeconfig', async () => {
    await expect(
      service.validateKubeconfig('kubeconfig', 'context'),
    ).resolves.toEqual({ error: null, valid: true });
  });

  it('should updateKubectlConfig', () => {
    expect(() =>
      service.updateKubectlConfig('kubeconfig', 'context'),
    ).not.toThrow();
  });

  it('should checkNamespace', async () => {
    await expect(service.checkNamespace('ns')).resolves.toBe(false);
  });

  it('should checkPod', async () => {
    await expect(service.checkPod('ns', 'pod')).resolves.toBe(true);
  });

  it('should checkDeployment', async () => {
    await expect(service.checkDeployment('ns', 'dep')).resolves.toBe(false);
  });

  it('should checkCustomResourceDefinition', async () => {
    await expect(service.checkCustomResourceDefinition('crd')).resolves.toBe(
      true,
    );
  });

  it('should createNamespace', async () => {
    await expect(service.createNamespace('ns')).resolves.toBeDefined();
  });
});
