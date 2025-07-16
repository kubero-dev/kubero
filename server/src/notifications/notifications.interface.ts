export interface INotification {
  name: string;
  user: string;
  resource:
    | 'user'
    | 'team'
    | 'role'
    | 'system'
    | 'app'
    | 'pipeline'
    | 'namespace'
    | 'phase'
    | 'unknown'
    | 'build'
    | 'addon'
    | 'settings'
    | 'events'
    | 'security'
    | 'templates'
    | 'config'
    | 'addons'
    | 'console'
    | 'logs'
    | 'reboot'
    | 'audit'
    | 'token';
  action: string;
  severity: 'normal' | 'info' | 'warning' | 'critical' | 'error' | 'unknown';
  message: string;
  phaseName: string;
  pipelineName: string;
  appName: string;
  data?: any;
}

export interface INotificationConfig {
  id?: string;
  enabled: boolean;
  name: string;
  type: 'slack' | 'webhook' | 'discord';
  pipelines: string[];
  events: string[];
  config: INotificationSlack | INotificationWebhook | INotificationDiscord;
}

export interface INotificationSlack {
  url: string;
  channel: string;
}

export interface INotificationWebhook {
  url: string;
  secret: string;
}

export interface INotificationDiscord {
  url: string;
}
