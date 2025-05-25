import { StatusService } from './status.service';
import { PipelinesService } from '../pipelines/pipelines.service';

describe('StatusService', () => {
  let service: StatusService;
  let mockCounter: any;
  let mockPipelinesService: any;

  beforeEach(() => {
    mockCounter = {
      inc: jest.fn(),
    };
    mockPipelinesService = {
      countPipelines: jest.fn(),
    };
    service = new StatusService(mockCounter, mockPipelinesService);
    // Mock logger to avoid actual logging in tests
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should increment counter if pipelines are counted', async () => {
    mockPipelinesService.countPipelines.mockResolvedValue(5);
    await service.updatePipelineCount();
    expect(mockCounter.inc).toHaveBeenCalledWith({}, 5);
  });

  it('should log warn if no pipelines found', async () => {
    mockPipelinesService.countPipelines.mockResolvedValue(undefined);
    const warnSpy = jest.spyOn(service['logger'], 'warn');
    await service.updatePipelineCount();
    expect(warnSpy).toHaveBeenCalledWith(
      'No pipelines found or error occurred while counting.',
    );
  });

  it('should log error if countPipelines throws', async () => {
    mockPipelinesService.countPipelines.mockRejectedValue(new Error('fail'));
    const errorSpy = jest.spyOn(service['logger'], 'error');
    await service.updatePipelineCount();
    expect(errorSpy).toHaveBeenCalledWith('Error counting pipelines: fail');
  });
});
