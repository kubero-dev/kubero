export interface AuditEntry {
  user: string;
  severity: 'normal' | 'info' | 'warning' | 'critical' | 'error' | 'unknown';
  action: string;
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
  namespace: string;
  phase: string;
  app: string;
  pipeline: string;
  message: string;
}
