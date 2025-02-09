export interface MetricsOptions {
  enabled: boolean,
  endpoint: string,
}

export interface PrometheusQuery {
  scale: '2h' | '24h' | '7d',
  pipeline: string,
  phase: string,
  app?: string,
  host?: string,
  calc?: 'rate' | 'increase'
}
export interface IMetric {
  name: string,
  metric: any,
  data: {
      x: Date,
      y: number
  }[]
}

export type Rule = {
  alert: any,
  duration: number,
  health: string,
  labels: any,
  name: string,
  query: string,
  alerting: boolean,
}