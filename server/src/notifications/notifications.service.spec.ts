import { NotificationsService } from './notifications.service';
import { EventsGateway } from '../events/events.gateway';
import { AuditService } from '../audit/audit.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { NotificationsDbService } from './notifications-db.service';
import { INotification, INotificationConfig } from './notifications.interface';

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({ status: 200 })),
}));

describe('NotificationsService', () => {
  let service: NotificationsService;
  let eventsGateway: jest.Mocked<EventsGateway>;
  let auditService: jest.Mocked<AuditService>;
  let kubectl: jest.Mocked<KubernetesService>;
  let notificationsDbService: jest.Mocked<NotificationsDbService>;

  beforeEach(() => {
    eventsGateway = { sendEvent: jest.fn() } as any;
    auditService = { log: jest.fn() } as any;
    kubectl = { createEvent: jest.fn() } as any;
    notificationsDbService = {
      getNotificationConfigs: jest.fn().mockResolvedValue([]),
    } as any;

    service = new NotificationsService(
      eventsGateway,
      auditService,
      kubectl,
      notificationsDbService,
    );
    service.setConfig({
      notifications: [],
    } as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call sendWebsocketMessage, createKubernetesEvent, writeAuditLog, and sendAllCustomNotification on send', async () => {
    const message: INotification = {
      name: 'test',
      user: 'user',
      resource: 'app',
      action: 'create',
      severity: 'info',
      message: 'msg',
      phaseName: 'dev',
      pipelineName: 'pipe',
      appName: 'app',
      data: {},
    };
    const spy = jest.spyOn<any, any>(
      service as any,
      'sendAllCustomNotification',
    );
    await service.send(message);
    expect(eventsGateway.sendEvent).toHaveBeenCalled();
    expect(kubectl.createEvent).toHaveBeenCalled();
    expect(auditService.log).toHaveBeenCalled();
    expect(notificationsDbService.getNotificationConfigs).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  it('should call send after delay in sendDelayed', () => {
    jest.useFakeTimers();
    const message = {
      name: 'test',
      user: 'user',
      resource: 'app',
      action: 'create',
      severity: 'info',
      message: 'msg',
      phaseName: 'dev',
      pipelineName: 'pipe',
      appName: 'app',
      data: {},
    } as INotification;
    const spy = jest.spyOn(service, 'send');
    service.sendDelayed(message);
    jest.runAllTimers();
    expect(spy).toHaveBeenCalledWith(message);
    jest.useRealTimers();
  });

  it('should send custom notifications for enabled configs and matching events/pipelines', () => {
    const slackConfig: INotificationConfig = {
      enabled: true,
      name: 'slack',
      type: 'slack',
      pipelines: ['pipe'],
      events: ['test'],
      config: { url: 'http://slack', channel: '#general' },
    };
    const webhookConfig: INotificationConfig = {
      enabled: true,
      name: 'webhook',
      type: 'webhook',
      pipelines: ['all'],
      events: ['test'],
      config: { url: 'http://webhook', secret: 'secret' },
    };
    const discordConfig: INotificationConfig = {
      enabled: true,
      name: 'discord',
      type: 'discord',
      pipelines: [],
      events: ['test'],
      config: { url: 'http://discord' },
    };
    service.setConfig({
      notifications: [slackConfig, webhookConfig, discordConfig],
    } as any);

    const spySlack = jest.spyOn<any, any>(
      service as any,
      'sendSlackNotification',
    );
    const spyWebhook = jest.spyOn<any, any>(
      service as any,
      'sendWebhookNotification',
    );
    const spyDiscord = jest.spyOn<any, any>(
      service as any,
      'sendDiscordNotification',
    );

    const message: INotification = {
      name: 'test',
      user: 'user',
      resource: 'app',
      action: 'create',
      severity: 'info',
      message: 'msg',
      phaseName: 'dev',
      pipelineName: 'pipe',
      appName: 'app',
      data: {},
    };

    (service as any).sendAllCustomNotification(
      service['config'].notifications,
      message,
    );

    expect(spySlack).toHaveBeenCalled();
    expect(spyWebhook).toHaveBeenCalled();
    expect(spyDiscord).toHaveBeenCalled();
  });

  it('should not send custom notification if notifications is undefined', () => {
    const spy = jest.spyOn<any, any>(service as any, 'sendCustomNotification');
    (service as any).sendAllCustomNotification(undefined, {} as INotification);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should call correct notification method in sendCustomNotification', () => {
    const message = {} as INotification;
    const slack = jest.spyOn<any, any>(service as any, 'sendSlackNotification');
    const webhook = jest.spyOn<any, any>(
      service as any,
      'sendWebhookNotification',
    );
    const discord = jest.spyOn<any, any>(
      service as any,
      'sendDiscordNotification',
    );

    (service as any).sendCustomNotification('slack', {}, message);
    (service as any).sendCustomNotification('webhook', {}, message);
    (service as any).sendCustomNotification('discord', {}, message);
    (service as any).sendCustomNotification('unknown', {}, message);

    expect(slack).toHaveBeenCalled();
    expect(webhook).toHaveBeenCalled();
    expect(discord).toHaveBeenCalled();
  });
});
