import { LogsService } from './logs.service';

describe('LogsService', () => {
  let service: LogsService;
  let kubectl: any;
  let pipelinesService: any;
  let eventsGateway: any;

  beforeEach(() => {
    kubectl = {
      setCurrentContext: jest.fn(),
      getPods: jest.fn(),
      log: {
        log: jest.fn().mockResolvedValue(undefined),
      },
    };
    pipelinesService = {
      getContext: jest.fn(),
    };
    eventsGateway = {
      sendLogline: jest.fn(),
    };
    service = new LogsService(kubectl, pipelinesService, eventsGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logcolor', () => {
    it('should return a color string', () => {
      const color = (service as any).logcolor('testpod');
      expect(typeof color).toBe('string');
      expect(color.startsWith('#')).toBe(true);
    });
  });

  describe('emitLogs', () => {
    it('should emit logs and call sendLogline', async () => {
      pipelinesService.getContext.mockResolvedValue('ctx');
      kubectl.setCurrentContext.mockReturnValue(undefined);
      kubectl.log.log.mockImplementation((_ns, _pod, _container, logStream) => {
        setTimeout(() => {
          logStream.emit('data', Buffer.from('logline'));
        }, 10);
        return Promise.resolve();
      });

      await service.emitLogs(
        'pipe',
        'phase',
        'app',
        'pod-foo-bar-123-456',
        'web',
      );
      // Simuliere das Eintreffen von Logdaten
      await new Promise((r) => setTimeout(r, 20));
      expect(eventsGateway.sendLogline).toHaveBeenCalled();
    });

    it('should not start logs if already running', async () => {
      pipelinesService.getContext.mockResolvedValue('ctx');
      (service as any).podLogStreams = ['pod-foo-bar-123-456'];
      const spy = jest.spyOn(kubectl.log, 'log');
      await service.emitLogs(
        'pipe',
        'phase',
        'app',
        'pod-foo-bar-123-456',
        'web',
      );
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('startLogging', () => {
    it('should call emitLogs for matching pods and containers', async () => {
      pipelinesService.getContext.mockResolvedValue('ctx');
      kubectl.getPods.mockResolvedValue([
        {
          metadata: { name: 'app-kuberoapp-123', labels: {} },
          spec: { containers: [{ name: 'web' }] },
        },
      ]);
      const spy = jest.spyOn(service, 'emitLogs').mockResolvedValue(undefined);
      await service.startLogging('pipe', 'phase', 'app');
      expect(spy).toHaveBeenCalledWith(
        'pipe',
        'phase',
        'app',
        'app-kuberoapp-123',
        'web',
      );
    });
  });

  describe('getLogsHistory', () => {
    it('should return loglines for web container', async () => {
      pipelinesService.getContext.mockResolvedValue('ctx');
      kubectl.getPods.mockResolvedValue([
        {
          metadata: { name: 'app-kuberoapp-123', labels: {} },
          spec: { containers: [{ name: 'web' }] },
        },
      ]);
      jest.spyOn(service, 'fetchLogs').mockResolvedValue([
        {
          id: 'id',
          time: Date.now(),
          pipeline: 'pipe',
          phase: 'phase',
          app: 'app',
          pod: 'app-kuberoapp-123',
          podID: '123-undefined',
          container: 'web',
          color: '#000000',
          log: 'logline',
        },
      ]);
      const result = await service.getLogsHistory(
        'pipe',
        'phase',
        'app',
        'web',
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].container).toBe('web');
    });

    it('should return empty array for unknown container', async () => {
      pipelinesService.getContext.mockResolvedValue('ctx');
      kubectl.getPods.mockResolvedValue([
        {
          metadata: { name: 'app-kuberoapp-123', labels: {} },
          spec: { containers: [{ name: 'web' }] },
        },
      ]);
      const result = await service.getLogsHistory(
        'pipe',
        'phase',
        'app',
        'unknown',
      );
      expect(result).toEqual([]);
    });
  });

  describe('fetchLogs', () => {
    it('should return parsed loglines', async () => {
      kubectl.log.log.mockImplementation((_ns, _pod, _container, logStream) => {
        logStream.emit(
          'data',
          Buffer.from(
            '2024-05-23T12:00:00Z logline1\n2024-05-23T12:01:00Z logline2\n',
          ),
        );
        return Promise.resolve();
      });
      const result = await service.fetchLogs(
        'ns',
        'pod-foo-bar-123-456',
        'web',
        'pipe',
        'phase',
        'app',
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].log).toBeDefined();
    });

    it('should return empty array on error', async () => {
      kubectl.log.log.mockRejectedValue(new Error('fail'));
      const result = await service.fetchLogs(
        'ns',
        'pod',
        'web',
        'pipe',
        'phase',
        'app',
      );
      expect(result).toEqual([]);
    });
  });
});
