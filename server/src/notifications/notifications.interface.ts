export interface INotification {
  name: string;
  user: string;
  resource:
    | 'system'
    | 'app'
    | 'pipeline'
    | 'phase'
    | 'namespace'
    | 'build'
    | 'addon'
    | 'settings'
    | 'user'
    | 'events'
    | 'security'
    | 'templates'
    | 'config'
    | 'addons'
    | 'kubernetes'
    | 'unknown';
  action: string;
  severity: 'normal' | 'info' | 'warning' | 'critical' | 'error' | 'unknown';
  message: string;
  phaseName: string;
  pipelineName: string;
  appName: string;
  data?: any;
}

export interface INotificationConfig {
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
