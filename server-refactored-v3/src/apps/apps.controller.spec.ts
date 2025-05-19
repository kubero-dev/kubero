import { Test, TestingModule } from '@nestjs/testing';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AppsController', () => {
  let controller: AppsController;
  let service: AppsService;

  const mockAppsService = {
    getApp: jest.fn(),
    createApp: jest.fn(),
    updateApp: jest.fn(),
    deleteApp: jest.fn(),
    createPRApp: jest.fn(),
    getTemplate: jest.fn(),
    restartApp: jest.fn(),
    getPods: jest.fn(),
    execInContainer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppsController],
      providers: [
        {
          provide: AppsService,
          useValue: mockAppsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AppsController>(AppsController);
    service = module.get<AppsService>(AppsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getApp', () => {
    it('should return app information', async () => {
      const mockApp = { name: 'test-app' };
      mockAppsService.getApp.mockResolvedValue(mockApp);

      const result = await controller.getApp('pipeline', 'phase', 'app');
      expect(result).toEqual(mockApp);
      expect(mockAppsService.getApp).toHaveBeenCalledWith('pipeline', 'phase', 'app');
    });
  });

  describe('createApp', () => {
    it('should throw an error if appName is not "new"', async () => {
      await expect(
        controller.createApp('pipeline', 'phase', 'invalid', { pipeline: 'pipeline', phase: 'phase' }),
      ).rejects.toThrow(HttpException);
    });

    it('should create an app', async () => {
      const mockApp = { pipeline: 'pipeline', phase: 'phase' };
      const mockUser = { id: 1, method: 'local', username: 'admin', apitoken: '1234567890' };
      mockAppsService.createApp.mockResolvedValue(mockApp);

      const result = await controller.createApp('pipeline', 'phase', 'new', mockApp);
      expect(result).toEqual(mockApp);
      expect(mockAppsService.createApp).toHaveBeenCalledWith(mockApp, mockUser);
    });
  });

  describe('updateApp', () => {
    it('should throw an error if appName does not match app.name', async () => {
      await expect(
        controller.updateApp('pipeline', 'phase', 'wrong-name', 'resourceVersion', { name: 'app' }),
      ).rejects.toThrow(HttpException);
    });

    it('should update an app', async () => {
      const mockApp = { name: 'app' };
      const mockUser = { id: 1, method: 'local', username: 'admin', apitoken: '1234567890' };
      mockAppsService.updateApp.mockResolvedValue(mockApp);

      const result = await controller.updateApp('pipeline', 'phase', 'app', 'resourceVersion', mockApp);
      expect(result).toEqual(mockApp);
      expect(mockAppsService.updateApp).toHaveBeenCalledWith(mockApp, 'resourceVersion', mockUser);
    });
  });

  describe('deleteApp', () => {
    it('should delete an app', async () => {
      const mockResult = { success: true };
      const mockUser = { id: 1, method: 'local', username: 'admin', apitoken: '1234567890' };
      mockAppsService.deleteApp.mockResolvedValue(mockResult);

      const result = await controller.deleteApp('pipeline', 'phase', 'app');
      expect(result).toEqual(mockResult);
      expect(mockAppsService.deleteApp).toHaveBeenCalledWith('pipeline', 'phase', 'app', mockUser);
    });
  });

  describe('restartApp', () => {
    it('should restart an app', async () => {
      const mockResult = { success: true };
      const mockUser = { id: 1, method: 'local', username: 'admin', apitoken: '1234567890' };
      mockAppsService.restartApp.mockResolvedValue(mockResult);

      const result = await controller.restartApp('pipeline', 'phase', 'app');
      expect(result).toEqual(mockResult);
      expect(mockAppsService.restartApp).toHaveBeenCalledWith('pipeline', 'phase', 'app', mockUser);
    });
  });

  describe('execInContainer', () => {
    it('should execute a command in a container', async () => {
      const mockResult = { success: true };
      const mockUser = { id: 1, method: 'local', username: 'admin', apitoken: '1234567890' };
      const body = { podName: 'pod', containerName: 'container', command: ['ls'] };
      mockAppsService.execInContainer.mockResolvedValue(mockResult);

      const result = await controller.execInContainer('pipeline', 'phase', 'app', body);
      expect(result).toEqual(mockResult);
      expect(mockAppsService.execInContainer).toHaveBeenCalledWith(
        'pipeline',
        'phase',
        'app',
        'pod',
        'container',
        ['ls'],
        mockUser,
      );
    });
  });
});
