import express, { Request, Response, query } from 'express';
import { Auth } from '../modules/auth';

export const Router = express.Router();
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();

import debug from 'debug';
//import rateLimit from 'express-rate-limit';
debug('app:routes')

Router.get('/metrics/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get metrics for a specific app'
    // #swagger.description = 'Get metrics for a specific app'
    // #swagger.parameters['pipeline'] = { description: 'Pipeline name' }
    // #swagger.parameters['phase'] = { description: 'Phase name' }
    // #swagger.parameters['app'] = { description: 'App name' }

    const metrics = await req.app.locals.kubero.getPodMetrics(
        req.params.pipeline,
        req.params.phase,
        req.params.app
    );
    res.send(metrics);
});

Router.get('/metrics', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get node metrics and metrics for all apps'

    const metrics = await req.app.locals.kubero.getNodeMetrics();
    res.send(metrics);
});

Router.get('/longtermmetrics', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get long term metrics'

    const metrics = await req.app.locals.metrics.getLongTermMetrics('up');
    res.send(metrics);
});

Router.get('/longtermmetrics/memory/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    try {
        const metrics = await req.app.locals.metrics.getMemoryMetrics({
            scale: req.query.scale as string || '24h',
            pipeline: req.params.pipeline,
            phase: req.params.phase,
            app: req.params.app
        }); // IMetric[]
        res.send(metrics);
    } catch (error) {
        //console.log(error)
        res.send(error)
    }
});


Router.get('/longtermmetrics/load/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    try {
        const metrics = await req.app.locals.metrics.getLoadMetrics({
            scale: req.query.scale as string || '24h',
            pipeline: req.params.pipeline,
            phase: req.params.phase,
            app: req.params.app
        }); // IMetric[]
        res.send(metrics);
    } catch (error) {
        //console.log(error)
        res.send(error)
    }
});

Router.get('/longtermmetrics/httpstatuscodes/:pipeline/:phase/:host/:calc', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    try {
        const metrics = await req.app.locals.metrics.getHttpStatusCodesMetrics({
            scale: req.query.scale as string || '24h',
            pipeline: req.params.pipeline,
            phase: req.params.phase,
            host: req.params.host,
            calc: req.params.calc
        }); // IMetric[]
        res.send(metrics);
    } catch (error) {
        //console.log(error)
        res.send(error)
    }
});

Router.get('/longtermmetrics/responsetime/:pipeline/:phase/:host/:calc', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    try {
        const metrics = await req.app.locals.metrics.getHttpResponseTimeMetrics({
            scale: req.query.scale as string || '24h',
            pipeline: req.params.pipeline,
            phase: req.params.phase,
            host: req.params.host,
            calc: req.params.calc
        }); // IMetric[]
        res.send(metrics);
    } catch (error) {
        //console.log(error)
        res.send(error)
    }
});