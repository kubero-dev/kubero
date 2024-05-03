import axios from 'axios';
import { PrometheusDriver, PrometheusQueryDate, QueryResult } from 'prometheus-query';

export interface MetricsOptions {
    endpoint: string,
}

interface PrometheusQuery {
    scale: '2h' | '24h' | '7d',
    pipeline: string,
    phase: string,
    app?: string,
    host?: string,
    calc?: 'rate' | 'increase'
}
interface IMetric {
    name: string,
    metric: any,
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
            preferPost: false,
            withCredentials: false,
        });

        this.prom.status().then((status) => {
            console.log('✅ Prometheus Metrics initialized:', options.endpoint);
        }).catch((error) => {
            console.log('❌ Prometheus status:', error);
        })
    }

    public async getLongTermMetrics(query: string): Promise<QueryResult | undefined> {
        let result: QueryResult | undefined;
        try {
            result = await this.prom.instantQuery(query);
        } catch (error) {
            console.log(error);
            console.log("query:", query);
            console.log(this.prom);
        }
        return result

        /* Manual Query
        const res = await axios.get('http://prometheus.localhost/api/v1/query', {
            params: {
                query: query
            }
        }).catch((error) => {
            console.log(error);
        });
        if (res === undefined) {
            return undefined
        }
        return res.data.data.result
        */
    }

    public async queryMetrics(metric:string, q: PrometheusQuery): Promise<QueryResult | undefined> {
        const query = `${metric}{namespace="${q.pipeline}-${q.phase}", container=~"kuberoapp-web|kuberoapp-worker"}`;
        console.log(query);
        const { end, start, step, vector } = this.getStepsAndStart(q.scale);
        let result: QueryResult | undefined;
        try {
            result = await this.prom.rangeQuery(query, start, end, step);
        } catch (error) {
            console.log(error);
            console.log(q);
            console.log("query:", query);
            console.log(end, start, step );
            console.log(this.prom);
        }
        return result;
    }

    public async getMemoryMetrics(q: PrometheusQuery): Promise<IMetric[]> {
        
        let resp = [] as IMetric[];
        let metrics: QueryResult
        try {
            const res = await this.queryMetrics('container_memory_rss', q);
            if (res === undefined) {
                throw new Error("no metrics found")
            } else {
                metrics = res;
            }
        } catch (error) {
            console.log("error fetching load metrics")
            throw error
        }
        for (let i = 0; i < metrics.result.length; i++) {
            const data = metrics.result[i].values.map((v: any) => {
                return [Date.parse(v.time), v.value / 1000000]
            });
            resp.push({
                name: metrics.result[i].metric.labels.pod,
                metric: metrics.result[i].metric,
                data: data
            });
        }

        return resp;
    }

    public async getLoadMetrics(q: PrometheusQuery): Promise<IMetric[]> {
        let resp = [] as IMetric[];
        let metrics: QueryResult
        try {
            const res = await this.queryMetrics('container_cpu_load_average_10s', q);
            if (res === undefined) {
                throw new Error("no metrics found")
            } else {
                metrics = res;
            }
        } catch (error) {
            console.log("error fetching load metrics")
            throw error
        }
        for (let i = 0; i < metrics.result.length; i++) {
            const data = metrics.result[i].values.map((v: any) => {
                return [Date.parse(v.time), v.value]
            });
            resp.push({
                name: metrics.result[i].metric.labels.pod,
                metric: metrics.result[i].metric,
                data: data
            });
        }

        return resp;
    }

    private getStepsAndStart(scale: string): { end: Date, start: number, step: number, vector: string} {
        const end = new Date();
        let start = new Date().getTime() - 24 * 60 * 60 * 1000
        let step = 60 * 10
        let vector = '5m'
        switch (scale) {
            case '2h':
                start = new Date().getTime() - 2 * 60 * 60 * 1000
                step = 48 // 48 seconds
                vector = '5m'
                break
            case '24h':
                start = new Date().getTime() - 24 * 60 * 60 * 1000
                step = 60 * 10 // 10 minutes
                vector = '10m'
                break
            case '7d':
                start = new Date().getTime() - 7 * 24 * 60 * 60 * 1000
                step = 60 * 120 // 700 minutes
                vector = '20m'
                break
        }

        return {
            end: end,
            start: start,
            step: step,
            vector: vector
        }
    }

    public async getCPUMetrics(q: PrometheusQuery): Promise<IMetric[]> {
        let resp = [] as IMetric[];
        let metrics: QueryResult

        const { end, start, step, vector } = this.getStepsAndStart(q.scale);
        // rate(nginx_ingress_controller_requests{namespace="asdf-production", host="a.a.localhost"}[10m])
        const query = `${q.calc}(container_cpu_system_seconds_total{namespace="${q.pipeline}-${q.phase}", container=~"kuberoapp-web|kuberoapp-worker"}[${vector}])`;
        console.log(query);
        try {
            metrics = await this.prom.rangeQuery(query, start, end, step);
            for (let i = 0; i < metrics.result.length; i++) {
                const data = metrics.result[i].values.map((v: any) => {
                    return [Date.parse(v.time), v.value]
                });
                resp.push({
                    name: metrics.result[i].metric.labels.pod,
                    metric: metrics.result[i].metric,
                    data: data
                });
            }
        } catch (error) {
            console.log(error);
            console.log(q);
            console.log("query:", query);
            console.log(end, start, step );
            console.log(this.prom);
        }
        return resp;
    }

    public async getHttpStatusCodesMetrics(q: PrometheusQuery): Promise<IMetric[]> {
        let resp = [] as IMetric[];
        let metrics: QueryResult

        const { end, start, step, vector } = this.getStepsAndStart(q.scale);
        // rate(nginx_ingress_controller_requests{namespace="asdf-production", host="a.a.localhost"}[10m])
        const query = `${q.calc}(nginx_ingress_controller_requests{namespace="${q.pipeline}-${q.phase}", host="${q.host}"}[${vector}])`;
        console.log(query);
        try {
            metrics = await this.prom.rangeQuery(query, start, end, step);
            for (let i = 0; i < metrics.result.length; i++) {
                const data = metrics.result[i].values.map((v: any) => {
                    return [Date.parse(v.time), v.value]
                });
                resp.push({
                    name: metrics.result[i].metric.labels.status,
                    metric: metrics.result[i].metric,
                    data: data
                });
            }
        } catch (error) {
            console.log(error);
            console.log(q);
            console.log("query:", query);
            console.log(end, start, step );
            console.log(this.prom);
        }
        return resp;
    }


    public async getHttpResponseTimeMetrics(q: PrometheusQuery): Promise<IMetric[]> {
        let resp = [] as IMetric[];
        let metrics: QueryResult

        const { end, start, step, vector } = this.getStepsAndStart(q.scale);
        // rate(nginx_ingress_controller_response_duration_seconds_count{namespace="asdf-production", host="a.a.localhost",status="200"}[10m]) //in ms
        const query = `${q.calc}(nginx_ingress_controller_response_duration_seconds_count{namespace="${q.pipeline}-${q.phase}", host="${q.host}", status="200"}[${vector}])`;
        console.log(query);
        try {
            metrics = await this.prom.rangeQuery(query, start, end, step);
            for (let i = 0; i < metrics.result.length; i++) {
                const data = metrics.result[i].values.map((v: any) => {
                    return [Date.parse(v.time), v.value/1000]
                });
                resp.push({
                    name: metrics.result[i].metric.labels.status,
                    metric: metrics.result[i].metric,
                    data: data
                });
            }
        } catch (error) {
            console.log(error);
            console.log(q);
            console.log("query:", query);
            console.log(end, start, step );
            console.log(this.prom);
        }
        return resp;
    }
    
    public async getHttpResponseTrafficMetrics(q: PrometheusQuery): Promise<IMetric[]> {
        let resp = [] as IMetric[];
        let metrics: QueryResult

        const { end, start, step, vector } = this.getStepsAndStart(q.scale);
        // sum(rate(nginx_ingress_controller_response_size_sum{namespace="asdf-production", host="a.a.localhost"}[10m]))
        const query = `sum(${q.calc}(nginx_ingress_controller_response_size_sum{namespace="${q.pipeline}-${q.phase}", host="${q.host}"}[${vector}]))`;
        console.log(query);
        try {
            metrics = await this.prom.rangeQuery(query, start, end, step);
            for (let i = 0; i < metrics.result.length; i++) {
                const data = metrics.result[i].values.map((v: any) => {
                    return [Date.parse(v.time), v.value/1000]
                });
                resp.push({
                    name: metrics.result[i].metric.labels.status,
                    metric: metrics.result[i].metric,
                    data: data
                });
            }
        } catch (error) {
            console.log(error);
            console.log(q);
            console.log("query:", query);
            console.log(end, start, step );
            console.log(this.prom);
        }
        return resp;
    }

}