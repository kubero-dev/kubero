import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { NotificationsDbService } from './notifications-db.service';
import {
  INotificationConfig,
  INotification,
  INotificationSlack,
  INotificationWebhook,
  INotificationDiscord,
} from './notifications.interface';
import { EventsGateway } from '../events/events.gateway';
import { IKuberoConfig } from '../config/config.interface';
import fetch from 'node-fetch';

@Injectable()
export class NotificationsService {
  //public kubectl: Kubectl;
  //private audit: Audit;
  private config: IKuberoConfig;
  private logger = new Logger(NotificationsService.name);

  constructor(
    private eventsGateway: EventsGateway,
    private auditService: AuditService,
    private kubectl: KubernetesService,
    private notificationsDbService: NotificationsDbService,
  ) {
    this.config = {} as IKuberoConfig;
    this.logger.log('NotificationsService initialized');
  }

  public setConfig(config: IKuberoConfig) {
    this.config = config;
  }

  public async send(message: INotification) {
    this.sendWebsocketMessage(message);
    this.createKubernetesEvent(message);
    this.writeAuditLog(message);

    // Load notifications from database instead of config
    try {
      const notifications =
        await this.notificationsDbService.getNotificationConfigs();
      this.sendAllCustomNotification(notifications, message);
    } catch (error) {
      this.logger.error('Failed to load notifications from database', error);
      // Fallback to config notifications if database fails
      if (this.config.notifications) {
        this.sendAllCustomNotification(this.config.notifications, message);
      }
    }

    /* requires configuration in pipeline and app form 
      if (message.data && message.data.app && message.data.app.notifications) {
          this.sendAllCustomNotification(message.data.app.notifications, message);
      }

      if (message.data && message.data.pipeline && message.data.pipeline.notifications) {
          this.sendAllCustomNotification(message.data.pipeline.notifications, message);
      }
      */
  }
  private sendWebsocketMessage(n: INotification) {
    this.eventsGateway.sendEvent(n.name, n);
  }

  private createKubernetesEvent(n: INotification) {
    this.kubectl.createEvent(
      'Normal',
      n.action.replace(/^./, (str) => str.toUpperCase()),
      n.name,
      n.message,
    );
  }

  private writeAuditLog(n: INotification) {
    this.auditService.log({
      action: n.action,
      user: n.user,
      severity: n.severity,
      namespace: n.appName + '-' + n.phaseName,
      phase: n.phaseName,
      app: n.appName,
      pipeline: n.pipelineName,
      resource: n.resource,
      message: n.message,
    });
  }

  public sendDelayed(message: INotification) {
    setTimeout(() => {
      this.send(message);
    }, 1000);
  }

  private sendAllCustomNotification(
    notifications: INotificationConfig[],
    message: INotification,
  ) {
    if (!notifications) {
      return;
    }
    notifications.forEach((notification) => {
      if (
        notification.enabled &&
        notification.events &&
        notification.events?.includes(message.name) &&
        (notification.pipelines?.length == 0 ||
          notification.pipelines?.includes('all') ||
          notification.pipelines?.includes(message.pipelineName))
      ) {
        this.sendCustomNotification(notification.type, notification.config, {
          name: notification.name,
          user: message.user,
          resource: message.resource,
          action: message.action,
          severity: message.severity,
          message: message.message,
          phaseName: message.phaseName,
          pipelineName: message.pipelineName,
          appName: message.appName,
          data: message.data,
        });
      }
    });
  }

  private sendCustomNotification(
    type: string,
    config: any,
    message: INotification,
  ) {
    switch (type) {
      case 'slack':
        this.sendSlackNotification(message, config as INotificationSlack);
        break;
      case 'webhook':
        this.sendWebhookNotification(message, config as INotificationWebhook);
        break;
      case 'discord':
        this.sendDiscordNotification(message, config as INotificationDiscord);
        break;
      default:
        console.log('unknown notification type', type);
        break;
    }
  }

  private sendSlackNotification(
    message: INotification,
    config: INotificationSlack,
  ) {
    // Docs: https://api.slack.com/messaging/webhooks#posting_with_webhooks
    fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message.message,
      }),
    })
      .then((res) =>
        console.log(
          'Slack notification sent to ' +
            config.url +
            ' with status ' +
            res.status,
        ),
      )
      //.then(json => console.log(json));
      .catch((err) =>
        console.log(
          'Slack notification failed to ' + config.url + ' with error ' + err,
        ),
      );
  }

  private sendWebhookNotification(
    message: INotification,
    config: INotificationWebhook,
  ) {
    fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        secret: config.secret,
      }),
    })
      .then((res) =>
        console.log(
          'Webhook notification sent to ' +
            config.url +
            ' with status ' +
            res.status,
        ),
      )
      .catch((err) =>
        console.log(
          'Webhook notification failed to ' + config.url + ' with error ' + err,
        ),
      );
  }

  private sendDiscordNotification(
    message: INotification,
    config: INotificationDiscord,
  ) {
    //Docs: https://discord.com/developers/docs/resources/webhook#execute-webhook
    fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message.message,
      }),
    })
      .then((res) =>
        console.log(
          'Discord notification sent to ' +
            config.url +
            ' with status ' +
            res.status,
        ),
      )
      .catch((err) =>
        console.log(
          'Discord notification failed to ' + config.url + ' with error ' + err,
        ),
      );
  }

  // Migration method to move notifications from config to database
  public async migrateNotificationsToDatabase(): Promise<void> {
    if (!this.config.notifications || this.config.notifications.length === 0) {
      this.logger.log('No notifications found in config to migrate');
      return;
    }

    this.logger.log(
      'Starting migration of notifications from config to database',
    );
    await this.notificationsDbService.migrateFromConfig(
      this.config.notifications,
    );
    this.logger.log(
      'Completed migration of notifications from config to database',
    );
  }

  // Method to get notifications from database (for admin interface)
  public async getNotifications(): Promise<INotificationConfig[]> {
    return await this.notificationsDbService.getNotificationConfigs();
  }
}
