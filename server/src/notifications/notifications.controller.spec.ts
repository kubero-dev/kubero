import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import {
  NotificationsDbService,
  CreateNotificationDto,
  UpdateNotificationDto,
} from './notifications-db.service';
import { INotificationConfig } from './notifications.interface';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsDbService>;

  const mockNotificationConfig: INotificationConfig = {
    id: '123',
    name: 'Test Notification',
    enabled: true,
    type: 'slack',
    pipelines: ['pipeline1', 'pipeline2'],
    events: ['deploy', 'build'],
    config: {
      url: 'https://hooks.slack.com/test',
      channel: '#general',
    },
  };

  const mockNotificationDb = {
    id: '123',
    name: 'Test Notification',
    enabled: true,
    type: 'slack' as const,
    pipelines: '["pipeline1", "pipeline2"]',
    events: '["deploy", "build"]',
    webhookUrl: null,
    webhookSecret: null,
    slackUrl: 'https://hooks.slack.com/test',
    slackChannel: '#general',
    discordUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      getNotificationConfigs: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      toNotificationConfig: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsDbService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get(NotificationsDbService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all notifications successfully', async () => {
      const mockNotifications = [mockNotificationConfig];
      service.getNotificationConfigs.mockResolvedValue(mockNotifications);

      const result = await controller.findAll();

      expect(result).toEqual({
        success: true,
        data: mockNotifications,
      });
      expect(service.getNotificationConfigs).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException when service fails', async () => {
      service.getNotificationConfigs.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.findAll()).rejects.toThrow(
        new HttpException(
          'Failed to fetch notifications',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('findOne', () => {
    const notificationId = '123';

    it('should return a notification by id successfully', async () => {
      service.findById.mockResolvedValue(mockNotificationDb);
      service.toNotificationConfig.mockReturnValue(mockNotificationConfig);

      const result = await controller.findOne(notificationId);

      expect(result).toEqual({
        success: true,
        data: mockNotificationConfig,
      });
      expect(service.findById).toHaveBeenCalledWith(notificationId);
      expect(service.toNotificationConfig).toHaveBeenCalledWith(
        mockNotificationDb,
      );
    });

    it('should throw NotFound when notification does not exist', async () => {
      service.findById.mockResolvedValue(null);

      await expect(controller.findOne(notificationId)).rejects.toThrow(
        new HttpException('Notification not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should re-throw HttpException from service', async () => {
      const httpError = new HttpException(
        'Service error',
        HttpStatus.BAD_REQUEST,
      );
      service.findById.mockRejectedValue(httpError);

      await expect(controller.findOne(notificationId)).rejects.toThrow(
        httpError,
      );
    });

    it('should throw Internal Server Error for other errors', async () => {
      service.findById.mockRejectedValue(new Error('Database error'));

      await expect(controller.findOne(notificationId)).rejects.toThrow(
        new HttpException(
          'Failed to fetch notification',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('create', () => {
    const createDto: CreateNotificationDto = {
      name: 'New Notification',
      enabled: true,
      type: 'slack',
      pipelines: ['pipeline1'],
      events: ['deploy'],
      config: {
        url: 'https://hooks.slack.com/test',
        channel: '#general',
      },
    };

    it('should create a notification successfully', async () => {
      service.create.mockResolvedValue(mockNotificationDb);
      service.toNotificationConfig.mockReturnValue(mockNotificationConfig);

      const result = await controller.create(createDto);

      expect(result).toEqual({
        success: true,
        data: mockNotificationConfig,
        message: 'Notification created successfully',
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw BadRequest when name is missing', async () => {
      const invalidDto = { ...createDto, name: '' };

      await expect(controller.create(invalidDto)).rejects.toThrow(
        new HttpException(
          'Name and type are required fields',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw BadRequest when type is missing', async () => {
      const invalidDto = { ...createDto, type: undefined as any };

      await expect(controller.create(invalidDto)).rejects.toThrow(
        new HttpException(
          'Name and type are required fields',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw BadRequest for invalid notification type', async () => {
      const invalidDto = { ...createDto, type: 'invalid' as any };

      await expect(controller.create(invalidDto)).rejects.toThrow(
        new HttpException(
          'Invalid notification type. Must be slack, webhook, or discord',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw BadRequest when slack config is missing URL', async () => {
      const invalidDto = {
        ...createDto,
        type: 'slack' as const,
        config: { channel: '#general' },
      };

      await expect(controller.create(invalidDto)).rejects.toThrow(
        new HttpException(
          'Slack notifications require a webhook URL',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw BadRequest when webhook config is missing URL', async () => {
      const invalidDto = {
        ...createDto,
        type: 'webhook' as const,
        config: { secret: 'secret' },
      };

      await expect(controller.create(invalidDto)).rejects.toThrow(
        new HttpException(
          'Webhook notifications require a URL',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw BadRequest when discord config is missing URL', async () => {
      const invalidDto = {
        ...createDto,
        type: 'discord' as const,
        config: {},
      };

      await expect(controller.create(invalidDto)).rejects.toThrow(
        new HttpException(
          'Discord notifications require a webhook URL',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should re-throw HttpException from service', async () => {
      const httpError = new HttpException(
        'Service error',
        HttpStatus.BAD_REQUEST,
      );
      service.create.mockRejectedValue(httpError);

      await expect(controller.create(createDto)).rejects.toThrow(httpError);
    });

    it('should throw Internal Server Error for other errors', async () => {
      service.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createDto)).rejects.toThrow(
        new HttpException(
          'Failed to create notification',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('update', () => {
    const notificationId = '123';
    const updateDto: Partial<CreateNotificationDto> = {
      name: 'Updated Notification',
      enabled: false,
    };

    it('should update a notification successfully', async () => {
      const updatedNotificationDb = {
        ...mockNotificationDb,
        name: updateDto.name || mockNotificationDb.name,
        enabled:
          updateDto.enabled !== undefined
            ? updateDto.enabled
            : mockNotificationDb.enabled,
      };
      const updatedNotificationConfig = {
        ...mockNotificationConfig,
        name: updateDto.name || mockNotificationConfig.name,
        enabled:
          updateDto.enabled !== undefined
            ? updateDto.enabled
            : mockNotificationConfig.enabled,
      };

      service.findById.mockResolvedValue(mockNotificationDb);
      service.update.mockResolvedValue(updatedNotificationDb);
      service.toNotificationConfig.mockReturnValue(updatedNotificationConfig);

      const result = await controller.update(notificationId, updateDto);

      expect(result).toEqual({
        success: true,
        data: updatedNotificationConfig,
        message: 'Notification updated successfully',
      });
      expect(service.findById).toHaveBeenCalledWith(notificationId);
      expect(service.update).toHaveBeenCalledWith(notificationId, updateDto);
    });

    it('should throw NotFound when notification does not exist', async () => {
      service.findById.mockResolvedValue(null);

      await expect(
        controller.update(notificationId, updateDto),
      ).rejects.toThrow(
        new HttpException('Notification not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw BadRequest for invalid notification type', async () => {
      service.findById.mockResolvedValue(mockNotificationDb);
      const invalidUpdateDto = { ...updateDto, type: 'invalid' as any };

      await expect(
        controller.update(notificationId, invalidUpdateDto),
      ).rejects.toThrow(
        new HttpException(
          'Invalid notification type. Must be slack, webhook, or discord',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should validate config when both type and config are provided', async () => {
      service.findById.mockResolvedValue(mockNotificationDb);
      const invalidUpdateDto = {
        type: 'slack' as const,
        config: { channel: '#general' }, // missing URL
      };

      await expect(
        controller.update(notificationId, invalidUpdateDto),
      ).rejects.toThrow(
        new HttpException(
          'Slack notifications require a webhook URL',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should re-throw HttpException from service', async () => {
      const httpError = new HttpException(
        'Service error',
        HttpStatus.BAD_REQUEST,
      );
      service.findById.mockResolvedValue(mockNotificationDb);
      service.update.mockRejectedValue(httpError);

      await expect(
        controller.update(notificationId, updateDto),
      ).rejects.toThrow(httpError);
    });

    it('should throw Internal Server Error for other errors', async () => {
      service.findById.mockResolvedValue(mockNotificationDb);
      service.update.mockRejectedValue(new Error('Database error'));

      await expect(
        controller.update(notificationId, updateDto),
      ).rejects.toThrow(
        new HttpException(
          'Failed to update notification',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('remove', () => {
    const notificationId = '123';

    it('should delete a notification successfully', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.remove(notificationId);

      expect(result).toEqual({
        success: true,
        message: 'Notification deleted successfully',
      });
      expect(service.delete).toHaveBeenCalledWith(notificationId);
    });

    it('should throw NotFound when notification does not exist', async () => {
      service.delete.mockRejectedValue(new Error('Notification not found'));

      await expect(controller.remove(notificationId)).rejects.toThrow(
        new HttpException('Notification not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw Internal Server Error for other errors', async () => {
      service.delete.mockRejectedValue(new Error('Database error'));

      await expect(controller.remove(notificationId)).rejects.toThrow(
        new HttpException(
          'Failed to delete notification',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('validateNotificationConfig', () => {
    it('should validate slack config successfully', () => {
      const config = {
        url: 'https://hooks.slack.com/test',
        channel: '#general',
      };

      expect(() => {
        (controller as any).validateNotificationConfig('slack', config);
      }).not.toThrow();
    });

    it('should validate webhook config successfully', () => {
      const config = { url: 'https://webhook.example.com', secret: 'secret' };

      expect(() => {
        (controller as any).validateNotificationConfig('webhook', config);
      }).not.toThrow();
    });

    it('should validate discord config successfully', () => {
      const config = { url: 'https://discord.com/api/webhooks/test' };

      expect(() => {
        (controller as any).validateNotificationConfig('discord', config);
      }).not.toThrow();
    });
  });
});
