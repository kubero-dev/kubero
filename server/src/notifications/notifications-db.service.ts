import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { INotificationConfig } from './notifications.interface';

// Define our own types since Prisma client isn't generated yet
export interface NotificationDb {
  id: string;
  name: string;
  enabled: boolean;
  type: 'slack' | 'webhook' | 'discord';
  pipelines: string; // JSON string
  events: string; // JSON string
  webhookUrl?: string | null;
  webhookSecret?: string | null;
  slackUrl?: string | null;
  slackChannel?: string | null;
  discordUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationDto {
  name: string;
  enabled: boolean;
  type: 'slack' | 'webhook' | 'discord';
  pipelines: string[];
  events: string[];
  config: {
    url?: string;
    secret?: string;
    channel?: string;
  };
}

export interface UpdateNotificationDto extends Partial<CreateNotificationDto> {
  id: string;
}

@Injectable()
export class NotificationsDbService {
  private readonly logger = new Logger(NotificationsDbService.name);
  private readonly prisma = new PrismaClient();

  async findAll(): Promise<NotificationDb[]> {
    return (await this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    })) as NotificationDb[];
  }

  async findById(id: string): Promise<NotificationDb | null> {
    return (await this.prisma.notification.findUnique({
      where: { id },
    })) as NotificationDb | null;
  }

  async create(data: CreateNotificationDto): Promise<NotificationDb> {
    const notificationData: any = {
      name: data.name,
      enabled: data.enabled,
      type: data.type,
      pipelines: JSON.stringify(data.pipelines),
      events: JSON.stringify(data.events),
    };

    // Map config fields based on notification type
    switch (data.type) {
      case 'webhook':
        notificationData.webhookUrl = data.config.url;
        notificationData.webhookSecret = data.config.secret;
        break;
      case 'slack':
        notificationData.slackUrl = data.config.url;
        notificationData.slackChannel = data.config.channel;
        break;
      case 'discord':
        notificationData.discordUrl = data.config.url;
        break;
    }

    const notification = (await this.prisma.notification.create({
      data: notificationData,
    })) as NotificationDb;

    this.logger.log(`Notification '${notification.name}' created successfully`);
    return notification;
  }

  async update(
    id: string,
    data: Partial<CreateNotificationDto>,
  ): Promise<NotificationDb> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.pipelines !== undefined)
      updateData.pipelines = JSON.stringify(data.pipelines);
    if (data.events !== undefined)
      updateData.events = JSON.stringify(data.events);

    // Clear existing config fields and set new ones
    if (data.config && data.type) {
      // Clear all config fields first
      updateData.webhookUrl = null;
      updateData.webhookSecret = null;
      updateData.slackUrl = null;
      updateData.slackChannel = null;
      updateData.discordUrl = null;

      // Set appropriate fields based on type
      switch (data.type) {
        case 'webhook':
          updateData.webhookUrl = data.config.url;
          updateData.webhookSecret = data.config.secret;
          break;
        case 'slack':
          updateData.slackUrl = data.config.url;
          updateData.slackChannel = data.config.channel;
          break;
        case 'discord':
          updateData.discordUrl = data.config.url;
          break;
      }
    }

    const notification = (await this.prisma.notification.update({
      where: { id },
      data: updateData,
    })) as NotificationDb;

    this.logger.log(`Notification '${notification.name}' updated successfully`);
    return notification;
  }

  async delete(id: string): Promise<void> {
    const notification = (await this.prisma.notification.findUnique({
      where: { id },
    })) as NotificationDb | null;

    if (!notification) {
      throw new Error(`Notification with id ${id} not found`);
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    this.logger.log(`Notification '${notification.name}' deleted successfully`);
  }

  // Convert database notification to the format expected by the notification service
  toNotificationConfig(notification: NotificationDb): INotificationConfig {
    const config: any = {};

    switch (notification.type) {
      case 'webhook':
        config.url = notification.webhookUrl;
        config.secret = notification.webhookSecret;
        break;
      case 'slack':
        config.url = notification.slackUrl;
        config.channel = notification.slackChannel;
        break;
      case 'discord':
        config.url = notification.discordUrl;
        break;
    }

    return {
      id: notification.id,
      enabled: notification.enabled,
      name: notification.name,
      type: notification.type as 'slack' | 'webhook' | 'discord',
      pipelines: JSON.parse(notification.pipelines),
      events: JSON.parse(notification.events),
      config,
    };
  }

  // Get all notifications in the format expected by the notification service
  async getNotificationConfigs(): Promise<INotificationConfig[]> {
    const notifications = await this.findAll();
    return notifications.map((notification) =>
      this.toNotificationConfig(notification),
    );
  }

  // Migration helper: Create notifications from YAML config
  async migrateFromConfig(
    configNotifications: INotificationConfig[],
  ): Promise<void> {
    this.logger.log(
      'Starting migration of notifications from YAML config to database',
    );

    for (const configNotification of configNotifications) {
      try {
        const existingNotification = await this.prisma.notification.findFirst({
          where: { name: configNotification.name },
        });

        if (existingNotification) {
          this.logger.warn(
            `Notification '${configNotification.name}' already exists in database, skipping`,
          );
          continue;
        }

        await this.create({
          name: configNotification.name,
          enabled: configNotification.enabled,
          type: configNotification.type as 'slack' | 'webhook' | 'discord',
          pipelines: configNotification.pipelines,
          events: configNotification.events,
          config: configNotification.config as any,
        });

        this.logger.log(
          `Migrated notification '${configNotification.name}' to database`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to migrate notification '${configNotification.name}': ${error.message}`,
        );
      }
    }

    this.logger.log(
      'Completed migration of notifications from YAML config to database',
    );
  }
}
