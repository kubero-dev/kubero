import { MetricsService } from './metrics.service';

jest.mock('prometheus-query', () => {
  return {
    PrometheusDriver: jest.fn().mockImplementation(() => ({
      status: jest.fn().mockResolvedValue(true),
      instantQuery: jest.fn().mockResolvedValue({
        result: [
          {
            metric: { labels: { pod: 'pod1', status: '200' } },
            values: [{ time: '2024-05-23T12:00:00Z', value: 123 }],
          },
        ],
      }),
      rangeQuery: jest.fn().mockResolvedValue({
        result: [
          {
            metric: { labels: { pod: 'pod1', status: '200' } },
            values: [{ time: '2024-05-23T12:00:00Z', value: 456 }],
          },
        ],
      }),
      rules: jest.fn().mockResolvedValue([
        {
          rules: [
            {
              type: 'alerting',
              alerts: [
                {
                  labels: {
                    namespace: 'pipe-phase',
                    service: 'app-kuberoapp',
                  },
                },
              ],
              duration: 10,
              health: 'ok',
              labels: { foo: 'bar' },
              name: 'TestRule',
              query: 'up',
            },
          ],
        },
      ]),
    })),
    QueryResult: jest.fn(),
    RuleGroup: jest.fn(),
  };
});

describe('MetricsService', () => {
  let service: MetricsService;
  let kubectl: any;

  beforeEach(() => {
    kubectl = {
      getPodMetrics: jest.fn().mockResolvedValue([{ pod: 'pod1', value: 1 }]),
      getPodUptimes: jest
        .fn()
        .mockResolvedValue([{ pod: 'pod1', uptime: 100 }]),
    };
    service = new MetricsService(kubectl);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should getStatus true', async () => {
    await expect(service.getStatus()).resolves.toBe(true);
  });

  it('should getLongTermMetrics', async () => {
    const result = await service.getLongTermMetrics('up');
    expect(result).toBeDefined();
    expect(result?.result[0].metric.labels.pod).toBe('pod1');
  });

  it('should queryMetrics', async () => {
    const q = { pipeline: 'pipe', phase: 'phase', scale: '24h' };
    const result = await service.queryMetrics('container_memory_rss', q as any);
    expect(result).toBeDefined();
    expect(result?.result[0].metric.labels.pod).toBe('pod1');
  });

  it('should getMemoryMetrics', async () => {
    const q = { pipeline: 'pipe', phase: 'phase', scale: '24h' };
    const result = await service.getMemoryMetrics(q as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe('pod1');
  });

  it('should getLoadMetrics', async () => {
    const q = { pipeline: 'pipe', phase: 'phase', scale: '24h' };
    const result = await service.getLoadMetrics(q as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe('pod1');
  });

  it('should getCPUMetrics', async () => {
    const q = { pipeline: 'pipe', phase: 'phase', scale: '24h', calc: 'rate' };
    const result = await service.getCPUMetrics(q as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe('pod1');
  });

  it('should getHttpStatusCodesMetrics', async () => {
    const q = {
      pipeline: 'pipe',
      phase: 'phase',
      scale: '24h',
      calc: 'rate',
      host: 'host',
    };
    const result = await service.getHttpStatusCodesMetrics(q as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe('200');
  });

  it('should getHttpResponseTimeMetrics', async () => {
    const q = {
      pipeline: 'pipe',
      phase: 'phase',
      scale: '24h',
      calc: 'rate',
      host: 'host',
    };
    const result = await service.getHttpResponseTimeMetrics(q as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe('200');
  });

  it('should getHttpResponseTrafficMetrics', async () => {
    const q = {
      pipeline: 'pipe',
      phase: 'phase',
      scale: '24h',
      calc: 'sum',
      host: 'host',
    };
    const result = await service.getHttpResponseTrafficMetrics(q as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe('200');
  });

  it('should getRules', async () => {
    const q = { pipeline: 'pipe', phase: 'phase', app: 'app' };
    const result = await service.getRules(q);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe('TestRule');
    expect(result[0].alerting).toBe(true);
  });

  it('should getPodMetrics', async () => {
    const result = await service.getPodMetrics('pipe', 'phase', 'app');
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].pod).toBe('pod1');
  });

  it('should getUptimes', async () => {
    const result = await service.getUptimes('pipe', 'phase');
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].pod).toBe('pod1');
  });

  it('should getStepsAndStart for 2h', () => {
    const result = (service as any).getStepsAndStart('2h');
    expect(result.vector).toBe('5m');
  });

  it('should getStepsAndStart for 24h', () => {
    const result = (service as any).getStepsAndStart('24h');
    expect(result.vector).toBe('10m');
  });

  it('should getStepsAndStart for 7d', () => {
    const result = (service as any).getStepsAndStart('7d');
    expect(result.vector).toBe('20m');
  });
});
