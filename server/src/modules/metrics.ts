import { PrometheusDriver, PrometheusQueryDate, QueryResult } from 'prometheus-query';

export interface MetricsOptions {
    endpoint: string,
}

interface PrometheusQuery {
    query: string,
    scale: string,
    pipeline: string,
    phase: string,
    app: string,
}
interface IMetric {
    name: string,
    data: {
        x: Date,
        y: number
    }[]
}

export class Metrics {
    private prom: PrometheusDriver

    constructor(
        options: MetricsOptions
    ) {

        this.prom = new PrometheusDriver({
            endpoint: options.endpoint,
        });
    }

    public async getLongTermMetrics(query: string): Promise<any> {
        return await this.prom.instantQuery(query);
    }

    public async queryMetrics(q: PrometheusQuery): Promise<QueryResult> {
        const query = `${q.query}{namespace="${q.pipeline}-${q.phase}", container="kuberoapp-web"}`;
        //console.log(query);
        const { end, start, step } = this.getStepsAndStart('24h');
        return this.prom.rangeQuery(query, start, end, step);
    }

    public async getMemoryMetrics(q: PrometheusQuery): Promise<any> {
        
        let resp = [] as IMetric[];
        const metrics = await this.queryMetrics(q);
        for (let i = 0; i < metrics.result.length; i++) {
            const data = metrics.result[i].values.map((v: any) => {
                return [Date.parse(v.time), v.value / 1000000]
            });
            resp.push({
                name: metrics.result[i].metric.labels.pod,
                data: data
            });
        }

        return resp;
    }

    private getStepsAndStart(scale: string): { end: Date, start: number, step: number } {
        const end = new Date();
        let start = new Date().getTime() - 24 * 60 * 60 * 1000
        let step = 60 * 10
        switch (scale) {
            case '2h':
                start = new Date().getTime() - 2 * 60 * 60 * 1000
                step = 48 // 48 seconds
                break
            case '24h':
                start = new Date().getTime() - 24 * 60 * 60 * 1000
                step = 60 * 10 // 10 minutes
                break
            case '7d':
                start = new Date().getTime() - 7 * 24 * 60 * 60 * 1000
                step = 60 * 700 // 700 minutes
                break
        }

        return {
            end: end,
            start: start,
            step: step
        }
    }

}