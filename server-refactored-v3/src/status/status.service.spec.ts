import { StatusService } from './status.service';
//import { PipelinesService } from '../pipelines/pipelines.service';
//import { AppsService } from '../apps/apps.service';


describe('StatusService', () => {
  let service: StatusService;
  let mockGauge: any;
  let mockPipelinesService: any;
  let mockAppsService: any;

  beforeEach(() => {
    mockGauge = {
      set: jest.fn(),
    };
    mockPipelinesService = {
      countPipelines: jest.fn(),
    };
    mockAppsService = {
      countApps: jest.fn(),
    };
    service = new StatusService(mockGauge, mockGauge, mockPipelinesService, mockAppsService);
    // Mock logger to avoid actual logging in tests
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should increment counter if pipelines are counted', async () => {
    mockPipelinesService.countPipelines.mockResolvedValue(5);
    await service.updateKuberoMetrics();
    expect(mockGauge.set).toHaveBeenCalledWith({}, 5);
  });

  describe('updateKuberoMetrics', () => {
    it('should increment both counters with correct values', async () => {
      mockPipelinesService.countPipelines.mockResolvedValue(7);
      mockAppsService.countApps.mockResolvedValue(12);
      
      await service.updateKuberoMetrics();
      
      expect(mockGauge.set).toHaveBeenCalledWith({}, 7);
      expect(mockGauge.set).toHaveBeenCalledWith({}, 12);
      expect(mockGauge.set).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPipelineCount', () => {
    it('should return pipeline count when successful', async () => {
      mockPipelinesService.countPipelines.mockResolvedValue(10);
      const result = await service.getPipelineCount();
      expect(result).toBe(10);
      expect(mockPipelinesService.countPipelines).toHaveBeenCalled();
    });

    it('should return 0 when countPipelines returns undefined', async () => {
      mockPipelinesService.countPipelines.mockResolvedValue(undefined);
      const result = await service.getPipelineCount();
      expect(result).toBe(0);
      expect(mockPipelinesService.countPipelines).toHaveBeenCalled();
    });

    it('should return 0 and log error when countPipelines throws', async () => {
      const error = new Error('Database error');
      mockPipelinesService.countPipelines.mockRejectedValue(error);
      
      const result = await service.getPipelineCount();
      
      expect(result).toBe(0);
      expect(service['logger'].error).toHaveBeenCalledWith(
        `Error getting pipeline count: ${error.message}`
      );
    });

    describe('getAppCount', () => {
      it('should return app count when successful', async () => {
        mockAppsService.countApps.mockResolvedValue(15);
        const result = await service.getAppCount();
        expect(result).toBe(15);
        expect(mockAppsService.countApps).toHaveBeenCalled();
      });

      it('should return 0 when countApps returns undefined', async () => {
        mockAppsService.countApps.mockResolvedValue(undefined);
        const result = await service.getAppCount();
        expect(result).toBe(0);
        expect(mockAppsService.countApps).toHaveBeenCalled();
      });

      it('should return 0 and log error when countApps throws', async () => {
        const error = new Error('Database error');
        mockAppsService.countApps.mockRejectedValue(error);
        
        const result = await service.getAppCount();
        
        expect(result).toBe(0);
        expect(service['logger'].error).toHaveBeenCalledWith(
          `Error getting app count: ${error.message}`
        );
      });
    });
  });
});
