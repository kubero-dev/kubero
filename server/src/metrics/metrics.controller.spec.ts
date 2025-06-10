import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { IMetric } from './metrics.interface';
import { QueryResult, ResponseType } from 'prometheus-query';

describe('MetricsController', () => {
  let controller: MetricsController;
  let service: jest.Mocked<MetricsService>;

  const mockIMetric: IMetric = {
    name: 'cpu_usage',
    metric: { pod: 'my-app-123', namespace: 'default' },
    data: [
      { x: new Date('2024-01-01T00:00:00Z'), y: 0.5 },
      { x: new Date('2024-01-01T01:00:00Z'), y: 0.7 },
    ],
  };

  const mockQueryResult = new QueryResult(ResponseType.VECTOR, [
    {
      metric: { __name__: 'up', job: 'test-job', instance: 'localhost:9090' },
      value: [1620000000, '1'],
    },
  ]);

  beforeEach(async () => {
    service = {
      getPodMetrics: jest.fn(),
      getUptimes: jest.fn(),
      getLongTermMetrics: jest.fn(),
      getMemoryMetrics: jest.fn(),
      getLoadMetrics: jest.fn(),
      getHttpStatusCodesMetrics: jest.fn(),
      getHttpResponseTimeMetrics: jest.fn(),
      getHttpResponseTrafficMetrics: jest.fn(),
      getCPUMetrics: jest.fn(),
      getRules: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [{ provide: MetricsService, useValue: service }],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get metrics for a specific app', async () => {
    service.getPodMetrics.mockResolvedValue({ cpu: 1, mem: 2 });
    const result = await controller.getMetrics('pipe', 'dev', 'app1');
    expect(service.getPodMetrics).toHaveBeenCalledWith('pipe', 'dev', 'app1');
    expect(result).toEqual({ cpu: 1, mem: 2 });
  });

  it('should get uptimes', async () => {
    service.getUptimes.mockResolvedValue([{ pod: 'a', uptime: 123 }]);
    const result = await controller.getUptimes('pipe', 'dev');
    expect(service.getUptimes).toHaveBeenCalledWith('pipe', 'dev');
    expect(result).toEqual([{ pod: 'a', uptime: 123 }]);
  });

  it('should get timeseries', async () => {
    service.getLongTermMetrics.mockResolvedValue(mockQueryResult);
    const result = await controller.getWideMetricsList();
    expect(service.getLongTermMetrics).toHaveBeenCalledWith('up');
    expect(result).toEqual({
      result: [
        {
          metric: {
            __name__: 'up',
            instance: 'localhost:9090',
            job: 'test-job',
          },
          value: [1620000000, '1'],
        },
      ],
      resultType: 'vector',
    });
  });

  it('should get wide metrics (memory)', async () => {
    mockIMetric.name = 'memory-metrics';
    service.getMemoryMetrics.mockResolvedValue([mockIMetric]);
    const result = await controller.getWideMetrics(
      'memory',
      'pipe',
      'dev',
      'app1',
      '24h',
      'rate',
      'host1',
    );
    expect(service.getMemoryMetrics).toHaveBeenCalledWith({
      scale: '24h',
      pipeline: 'pipe',
      phase: 'dev',
      app: 'app1',
    });
    expect(result).toEqual([
      {
        data: [
          { x: new Date('2024-01-01T00:00:00Z'), y: 0.5 },
          { x: new Date('2024-01-01T01:00:00Z'), y: 0.7 },
        ],
        metric: { namespace: 'default', pod: 'my-app-123' },
        name: 'memory-metrics',
      },
    ]);
  });

  it('should get wide metrics (cpu)', async () => {
    mockIMetric.name = 'cpu-metrics';
    service.getCPUMetrics.mockResolvedValue([mockIMetric]);
    const result = await controller.getWideMetrics(
      'cpu',
      'pipe',
      'dev',
      'app1',
      '2h',
      'rate',
      'host1',
    );
    expect(service.getCPUMetrics).toHaveBeenCalledWith({
      scale: '2h',
      pipeline: 'pipe',
      phase: 'dev',
      app: 'app1',
      calc: 'rate',
    });
    expect(result).toEqual([
      {
        data: [
          { x: new Date('2024-01-01T00:00:00Z'), y: 0.5 },
          { x: new Date('2024-01-01T01:00:00Z'), y: 0.7 },
        ],
        metric: { namespace: 'default', pod: 'my-app-123' },
        name: 'cpu-metrics',
      },
    ]);
  });

  it('should get wide metrics (httpstatuscodes)', async () => {
    mockIMetric.name = 'httpstatus-metrics';
    service.getHttpStatusCodesMetrics.mockResolvedValue([mockIMetric]);
    const result = await controller.getWideMetrics(
      'httpstatuscodes',
      'pipe',
      'dev',
      'app1',
      '7d',
      'increase',
      'host1',
    );
    expect(service.getHttpStatusCodesMetrics).toHaveBeenCalledWith({
      scale: '7d',
      pipeline: 'pipe',
      phase: 'dev',
      host: 'host1',
      calc: 'increase',
    });
    expect(result).toEqual([
      {
        data: [
          { x: new Date('2024-01-01T00:00:00Z'), y: 0.5 },
          { x: new Date('2024-01-01T01:00:00Z'), y: 0.7 },
        ],
        metric: { namespace: 'default', pod: 'my-app-123' },
        name: 'httpstatus-metrics',
      },
    ]);
  });

  it('should get rules', async () => {
    service.getRules.mockResolvedValue(['rule1']);
    const result = await controller.getRules('pipe', 'dev', 'app1');
    expect(service.getRules).toHaveBeenCalledWith({
      pipeline: 'pipe',
      phase: 'dev',
      app: 'app1',
    });
    expect(result).toEqual(['rule1']);
  });

  it('should return "Invalid type" for unknown metric type', async () => {
    const result = await controller.getWideMetrics(
      'unknown' as any,
      'pipe',
      'dev',
      'app1',
      '7d',
      'increase',
      'host1',
    );
    expect(result).toBe('Invalid type');
  });
});
