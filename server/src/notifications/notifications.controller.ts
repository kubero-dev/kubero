import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  NotificationsDbService,
  CreateNotificationDto,
  UpdateNotificationDto,
} from './notifications-db.service';
import { INotificationConfig } from './notifications.interface';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

@Controller('api/notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly notificationsDbService: NotificationsDbService,
  ) {}

  @Get()
  async findAll(): Promise<ApiResponse<INotificationConfig[]>> {
    try {
      const notifications =
        await this.notificationsDbService.getNotificationConfigs();
      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      this.logger.error('Failed to fetch notifications', error);
      throw new HttpException(
        'Failed to fetch notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<INotificationConfig>> {
    try {
      const notification = await this.notificationsDbService.findById(id);
      if (!notification) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: this.notificationsDbService.toNotificationConfig(notification),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to fetch notification ${id}`, error);
      throw new HttpException(
        'Failed to fetch notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<ApiResponse<INotificationConfig>> {
    try {
      // Validate required fields
      if (!createNotificationDto.name || !createNotificationDto.type) {
        throw new HttpException(
          'Name and type are required fields',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate notification type
      if (
        !['slack', 'webhook', 'discord'].includes(createNotificationDto.type)
      ) {
        throw new HttpException(
          'Invalid notification type. Must be slack, webhook, or discord',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate config based on type
      this.validateNotificationConfig(
        createNotificationDto.type,
        createNotificationDto.config,
      );

      const notification = await this.notificationsDbService.create(
        createNotificationDto,
      );

      return {
        success: true,
        data: this.notificationsDbService.toNotificationConfig(notification),
        message: 'Notification created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Failed to create notification', error);
      throw new HttpException(
        'Failed to create notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: Partial<CreateNotificationDto>,
  ): Promise<ApiResponse<INotificationConfig>> {
    try {
      // Check if notification exists
      const existingNotification =
        await this.notificationsDbService.findById(id);
      if (!existingNotification) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }

      // Validate notification type if provided
      if (
        updateNotificationDto.type &&
        !['slack', 'webhook', 'discord'].includes(updateNotificationDto.type)
      ) {
        throw new HttpException(
          'Invalid notification type. Must be slack, webhook, or discord',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate config if provided
      if (updateNotificationDto.config && updateNotificationDto.type) {
        this.validateNotificationConfig(
          updateNotificationDto.type,
          updateNotificationDto.config,
        );
      }

      const notification = await this.notificationsDbService.update(
        id,
        updateNotificationDto,
      );

      return {
        success: true,
        data: this.notificationsDbService.toNotificationConfig(notification),
        message: 'Notification updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to update notification ${id}`, error);
      throw new HttpException(
        'Failed to update notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse> {
    try {
      await this.notificationsDbService.delete(id);

      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
      this.logger.error(`Failed to delete notification ${id}`, error);
      throw new HttpException(
        'Failed to delete notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateNotificationConfig(type: string, config: any): void {
    switch (type) {
      case 'slack':
        if (!config.url) {
          throw new HttpException(
            'Slack notifications require a webhook URL',
            HttpStatus.BAD_REQUEST,
          );
        }
        break;
      case 'webhook':
        if (!config.url) {
          throw new HttpException(
            'Webhook notifications require a URL',
            HttpStatus.BAD_REQUEST,
          );
        }
        break;
      case 'discord':
        if (!config.url) {
          throw new HttpException(
            'Discord notifications require a webhook URL',
            HttpStatus.BAD_REQUEST,
          );
        }
        break;
    }
  }
}
