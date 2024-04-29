import express, { Request, Response } from 'express';
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

    const metrics = await req.app.locals.metrics.getMemoryMetrics({
        query: 'container_memory_rss',
        scale: '24h',
        pipeline: req.params.pipeline,
        phase: req.params.phase,
        app: req.params.app
    });
    res.send(metrics);
});