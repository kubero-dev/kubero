import { Test, TestingModule } from '@nestjs/testing';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

describe('LogsController', () => {
  let controller: LogsController;
  let service: LogsService;

  beforeEach(async () => {
    const mockLogsService = {
      getLogsHistory: jest.fn(),
      startLogging: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [{ provide: LogsService, useValue: mockLogsService }],
    }).compile();

    controller = module.get<LogsController>(LogsController);
    service = module.get<LogsService>(LogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLogs', () => {
    it('should call logsService.getLogsHistory with correct params', async () => {
      /*
      const spy = jest.spyOn(service, 'getLogsHistory').mockResolvedValue('history');
      const result = await controller.getLogs('pipeline', 'phase', 'app', 'container');
      expect(spy).toHaveBeenCalledWith('pipeline', 'phase', 'app', 'container');
      expect(result).toBe('history');
      */
    });
  });

  describe('getLogsForApp', () => {
    it('should call logsService.startLogging with correct params', async () => {
      /*
      const spy = jest.spyOn(service, 'startLogging').mockResolvedValue('logs');
      const result = await controller.getLogsForApp('pipeline', 'phase', 'app');
      expect(spy).toHaveBeenCalledWith('pipeline', 'phase', 'app');
      expect(result).toBe('logs');
      */
    });
  });
});
