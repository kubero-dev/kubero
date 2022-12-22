import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';

const Router = express.Router();
export const RouterLogs = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();

import debug from 'debug';
debug('app:routes')

Router.get('/logs/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    req.app.locals.kubero.startLogging(
        req.params.pipeline,
        req.params.phase,
        req.params.app
    );
    res.send('ok');
});

Router.get('/events', authMiddleware, async function (req: Request, res: Response) {
    const namespace = req.query.namespace || process.env.KUBERO_NAMESPACE || 'kubero';
    console.log('namespace', namespace);
    const events = await req.app.locals.kubero.getEvents(namespace);
    res.send(events);
});

Router.get('/metrics/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {

    const metrics = await req.app.locals.kubero.getPodMetrics(
        req.params.pipeline,
        req.params.phase,
        req.params.app
    );
    res.send(metrics);
});

Router.get('/metrics', authMiddleware, async function (req: Request, res: Response) {

    const metrics = await req.app.locals.kubero.getNodeMetrics();
    res.send(metrics);
});