import { Test, TestingModule } from '@nestjs/testing';
import {
  NotificationsDbService,
  CreateNotificationDto,
  NotificationDb,
} from './notifications-db.service';
import { INotificationConfig } from './notifications.interface';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
const mockPrismaClient = {
  notification: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

describe('NotificationsDbService', () => {
  let service: NotificationsDbService;
  let prisma: any;

  const mockNotificationDb: NotificationDb = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Notification',
    enabled: true,
    type: 'slack',
    pipelines: '["pipeline1", "pipeline2"]',
    events: '["deploy", "build"]',
    webhookUrl: null,
    webhookSecret: null,
    slackUrl: 'https://hooks.slack.com/test',
    slackChannel: '#general',
    discordUrl: null,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
  };

  const mockCreateNotificationDto: CreateNotificationDto = {
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

  const mockNotificationConfig: INotificationConfig = {
    id: '123e4567-e89b-12d3-a456-426614174000',
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

  beforeEach(async () => {
    // Clear all mock calls before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsDbService],
    }).compile();

    service = module.get<NotificationsDbService>(NotificationsDbService);
    prisma = mockPrismaClient;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all notifications ordered by createdAt desc', async () => {
      const notifications = [mockNotificationDb];
      prisma.notification.findMany.mockResolvedValue(notifications);

      const result = await service.findAll();

      expect(result).toEqual(notifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no notifications exist', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      prisma.notification.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    const notificationId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return notification by id', async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotificationDb);

      const result = await service.findById(notificationId);

      expect(result).toEqual(mockNotificationDb);
      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: notificationId },
      });
    });

    it('should return null when notification not found', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      const result = await service.findById(notificationId);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      prisma.notification.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findById(notificationId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('create', () => {
    it('should create a slack notification successfully', async () => {
      const createDto = mockCreateNotificationDto;
      prisma.notification.create.mockResolvedValue(mockNotificationDb);

      const result = await service.create(createDto);

      expect(result).toEqual(mockNotificationDb);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          enabled: createDto.enabled,
          type: createDto.type,
          pipelines: JSON.stringify(createDto.pipelines),
          events: JSON.stringify(createDto.events),
          slackUrl: createDto.config.url,
          slackChannel: createDto.config.channel,
        },
      });
    });

    it('should create a webhook notification successfully', async () => {
      const webhookDto: CreateNotificationDto = {
        name: 'Webhook Notification',
        enabled: true,
        type: 'webhook',
        pipelines: ['pipeline1'],
        events: ['deploy'],
        config: {
          url: 'https://webhook.example.com',
          secret: 'secret123',
        },
      };

      const webhookNotificationDb = {
        ...mockNotificationDb,
        type: 'webhook' as const,
        webhookUrl: 'https://webhook.example.com',
        webhookSecret: 'secret123',
        slackUrl: null,
        slackChannel: null,
      };

      prisma.notification.create.mockResolvedValue(webhookNotificationDb);

      const result = await service.create(webhookDto);

      expect(result).toEqual(webhookNotificationDb);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          name: webhookDto.name,
          enabled: webhookDto.enabled,
          type: webhookDto.type,
          pipelines: JSON.stringify(webhookDto.pipelines),
          events: JSON.stringify(webhookDto.events),
          webhookUrl: webhookDto.config.url,
          webhookSecret: webhookDto.config.secret,
        },
      });
    });

    it('should create a discord notification successfully', async () => {
      const discordDto: CreateNotificationDto = {
        name: 'Discord Notification',
        enabled: true,
        type: 'discord',
        pipelines: ['pipeline1'],
        events: ['deploy'],
        config: {
          url: 'https://discord.com/api/webhooks/test',
        },
      };

      const discordNotificationDb = {
        ...mockNotificationDb,
        type: 'discord' as const,
        discordUrl: 'https://discord.com/api/webhooks/test',
        slackUrl: null,
        slackChannel: null,
      };

      prisma.notification.create.mockResolvedValue(discordNotificationDb);

      const result = await service.create(discordDto);

      expect(result).toEqual(discordNotificationDb);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          name: discordDto.name,
          enabled: discordDto.enabled,
          type: discordDto.type,
          pipelines: JSON.stringify(discordDto.pipelines),
          events: JSON.stringify(discordDto.events),
          discordUrl: discordDto.config.url,
        },
      });
    });

    it('should handle database errors during creation', async () => {
      prisma.notification.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(mockCreateNotificationDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('update', () => {
    const notificationId = '123e4567-e89b-12d3-a456-426614174000';

    it('should update notification fields successfully', async () => {
      const updateData = {
        name: 'Updated Notification',
        enabled: false,
      };

      const updatedNotification = {
        ...mockNotificationDb,
        ...updateData,
      };

      prisma.notification.update.mockResolvedValue(updatedNotification);

      const result = await service.update(notificationId, updateData);

      expect(result).toEqual(updatedNotification);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: updateData,
      });
    });

    it('should update notification with config and type', async () => {
      const updateData = {
        type: 'webhook' as const,
        config: {
          url: 'https://new-webhook.example.com',
          secret: 'newsecret',
        },
      };

      const updatedNotification = {
        ...mockNotificationDb,
        type: 'webhook' as const,
        webhookUrl: 'https://new-webhook.example.com',
        webhookSecret: 'newsecret',
        slackUrl: null,
        slackChannel: null,
        discordUrl: null,
      };

      prisma.notification.update.mockResolvedValue(updatedNotification);

      const result = await service.update(notificationId, updateData);

      expect(result).toEqual(updatedNotification);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: {
          type: updateData.type,
          webhookUrl: updateData.config.url,
          webhookSecret: updateData.config.secret,
          slackUrl: null,
          slackChannel: null,
          discordUrl: null,
        },
      });
    });

    it('should update pipelines and events as JSON strings', async () => {
      const updateData = {
        pipelines: ['new-pipeline1', 'new-pipeline2'],
        events: ['new-event1', 'new-event2'],
      };

      const updatedNotification = {
        ...mockNotificationDb,
        pipelines: JSON.stringify(updateData.pipelines),
        events: JSON.stringify(updateData.events),
      };

      prisma.notification.update.mockResolvedValue(updatedNotification);

      const result = await service.update(notificationId, updateData);

      expect(result).toEqual(updatedNotification);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: {
          pipelines: JSON.stringify(updateData.pipelines),
          events: JSON.stringify(updateData.events),
        },
      });
    });

    it('should handle database errors during update', async () => {
      prisma.notification.update.mockRejectedValue(new Error('Database error'));

      await expect(
        service.update(notificationId, { name: 'Updated' }),
      ).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    const notificationId = '123e4567-e89b-12d3-a456-426614174000';

    it('should delete notification successfully', async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotificationDb);
      prisma.notification.delete.mockResolvedValue(mockNotificationDb);

      await service.delete(notificationId);

      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: notificationId },
      });
      expect(prisma.notification.delete).toHaveBeenCalledWith({
        where: { id: notificationId },
      });
    });

    it('should throw error when notification not found', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.delete(notificationId)).rejects.toThrow(
        `Notification with id ${notificationId} not found`,
      );
      expect(prisma.notification.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors during deletion', async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotificationDb);
      prisma.notification.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.delete(notificationId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('toNotificationConfig', () => {
    it('should convert slack notification to config format', () => {
      const result = service.toNotificationConfig(mockNotificationDb);

      expect(result).toEqual(mockNotificationConfig);
    });

    it('should convert webhook notification to config format', () => {
      const webhookNotificationDb = {
        ...mockNotificationDb,
        type: 'webhook' as const,
        webhookUrl: 'https://webhook.example.com',
        webhookSecret: 'secret123',
        slackUrl: null,
        slackChannel: null,
      };

      const expectedConfig = {
        ...mockNotificationConfig,
        type: 'webhook' as const,
        config: {
          url: 'https://webhook.example.com',
          secret: 'secret123',
        },
      };

      const result = service.toNotificationConfig(webhookNotificationDb);

      expect(result).toEqual(expectedConfig);
    });

    it('should convert discord notification to config format', () => {
      const discordNotificationDb = {
        ...mockNotificationDb,
        type: 'discord' as const,
        discordUrl: 'https://discord.com/api/webhooks/test',
        slackUrl: null,
        slackChannel: null,
      };

      const expectedConfig = {
        ...mockNotificationConfig,
        type: 'discord' as const,
        config: {
          url: 'https://discord.com/api/webhooks/test',
        },
      };

      const result = service.toNotificationConfig(discordNotificationDb);

      expect(result).toEqual(expectedConfig);
    });

    it('should parse JSON strings for pipelines and events', () => {
      const notificationWithComplexData = {
        ...mockNotificationDb,
        pipelines: '["pipeline1", "pipeline2", "pipeline3"]',
        events: '["deploy", "build", "test"]',
      };

      const result = service.toNotificationConfig(notificationWithComplexData);

      expect(result.pipelines).toEqual(['pipeline1', 'pipeline2', 'pipeline3']);
      expect(result.events).toEqual(['deploy', 'build', 'test']);
    });
  });

  describe('getNotificationConfigs', () => {
    it('should return all notifications in config format', async () => {
      const notifications = [mockNotificationDb];
      prisma.notification.findMany.mockResolvedValue(notifications);

      const result = await service.getNotificationConfigs();

      expect(result).toEqual([mockNotificationConfig]);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no notifications exist', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      const result = await service.getNotificationConfigs();

      expect(result).toEqual([]);
    });
  });

  describe('migrateFromConfig', () => {
    const configNotifications: INotificationConfig[] = [
      mockNotificationConfig,
      {
        name: 'Webhook Config',
        enabled: true,
        type: 'webhook',
        pipelines: ['pipeline1'],
        events: ['deploy'],
        config: {
          url: 'https://webhook.example.com',
          secret: 'secret123',
        },
      },
    ];

    it('should migrate notifications from config successfully', async () => {
      prisma.notification.findFirst
        .mockResolvedValueOnce(null) // First notification doesn't exist
        .mockResolvedValueOnce(null); // Second notification doesn't exist

      prisma.notification.create
        .mockResolvedValueOnce(mockNotificationDb)
        .mockResolvedValueOnce({
          ...mockNotificationDb,
          name: 'Webhook Config',
          type: 'webhook',
        });

      await service.migrateFromConfig(configNotifications);

      expect(prisma.notification.findFirst).toHaveBeenCalledTimes(2);
      expect(prisma.notification.create).toHaveBeenCalledTimes(2);
    });

    it('should skip existing notifications during migration', async () => {
      prisma.notification.findFirst
        .mockResolvedValueOnce(mockNotificationDb) // First notification exists
        .mockResolvedValueOnce(null); // Second notification doesn't exist

      prisma.notification.create.mockResolvedValueOnce({
        ...mockNotificationDb,
        name: 'Webhook Config',
        type: 'webhook',
      });

      await service.migrateFromConfig(configNotifications);

      expect(prisma.notification.findFirst).toHaveBeenCalledTimes(2);
      expect(prisma.notification.create).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during migration gracefully', async () => {
      prisma.notification.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      prisma.notification.create
        .mockRejectedValueOnce(new Error('Creation failed'))
        .mockResolvedValueOnce(mockNotificationDb);

      // Should not throw, but handle errors gracefully
      await expect(
        service.migrateFromConfig(configNotifications),
      ).resolves.not.toThrow();

      expect(prisma.notification.create).toHaveBeenCalledTimes(2);
    });
  });
});
