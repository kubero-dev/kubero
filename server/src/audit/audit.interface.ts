export interface AuditEntry {
  user: string;
  severity: 'normal' | 'info' | 'warning' | 'critical' | 'error' | 'unknown';
  action: string;
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
  namespace: string;
  phase: string;
  app: string;
  pipeline: string;
  message: string;
}
