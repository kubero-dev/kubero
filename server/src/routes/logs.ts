import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';

const Router = express.Router();
export const RouterLogs = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();

import debug from 'debug';
//import rateLimit from 'express-rate-limit';
debug('app:routes')

Router.get('/logs/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get logs for a specific app'
    // #swagger.description = 'Get logs for a specific app'
    // #swagger.parameters['pipeline'] = { description: 'Pipeline name' }
    // #swagger.parameters['phase'] = { description: 'Phase name' }
    // #swagger.parameters['app'] = { description: 'App name' }

    req.app.locals.kubero.startLogging(
        req.params.pipeline,
        req.params.phase,
        req.params.app
    );
    res.send('ok');
});

Router.get('/logs/:pipeline/:phase/:app/:container/history', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get logs history for a specific app'
    // #swagger.description = 'Get logs history for a specific app'
    // #swagger.parameters['pipeline'] = { description: 'Pipeline name' }
    // #swagger.parameters['phase'] = { description: 'Phase name' }
    // #swagger.parameters['app'] = { description: 'App name' }

    const logs = await req.app.locals.kubero.getLogsHistory(
        req.params.pipeline,
        req.params.phase,
        req.params.app,
        req.params.container
    );
    res.send(logs);
});

Router.get('/events', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the Kubero Kubernetes events'
    const namespace = req.query.namespace || process.env.KUBERO_NAMESPACE || 'kubero';
    console.log('namespace', namespace);
    const events = await req.app.locals.kubero.getEvents(namespace);
    res.send(events);
});
/*
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
});
*/
//Router.get('/audit', authMiddleware, limiter, async function (req: Request, res: Response) {
Router.get('/audit', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the Kubero audit log'
    const limit = req.query.limit || 100;
    const pipeline = req.query.pipeline || '';
    const phase = req.query.phase || '';
    const app = req.query.app || '';

    let audit;
    if (pipeline !== '' && phase !== '' && app !== '') {
        audit = await req.app.locals.audit.getAppEntries(pipeline, phase, app, limit);
    } else {
        audit = await req.app.locals.audit.get(limit);
    }

    const count = await req.app.locals.audit.count();
    const response = {
        audit: audit,
        count: count,
        limit: limit
    }

    res.send(response);
    
});

Router.get('/uptimes/:pipeline/:phase/', authMiddleware, async function (req: Request, res: Response) {
    const uptimes = await req.app.locals.kubero.getPodUptime(
        req.params.pipeline,
        req.params.phase
    );
    res.send(uptimes);
});

Router.get('/console/:pipeline/:phase/:app/exec', authMiddleware, async function (req: Request, res: Response) {
    // https://github.com/kubernetes-client/javascript/blob/master/examples/typescript/exec/exec-example.ts
    
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Start a container console'
    req.params.pipeline = "test";
    req.params.phase = "production";
    req.params.app = "go-httpbin";

    let podName = "kubectl-kuberoapp-web-786b847d9f-4dw96";
    //podName = "go-httpbin-kuberoapp-web-86f8dd7f46-zph9h";
    const containerName = "kuberoapp-web";
    const command = 'sh'
    const user = 'nobody'

    await req.app.locals.kubero.execInContainer(req.params.pipeline, req.params.phase, req.params.app, podName, containerName, command, user);
    res.send(console);
});

Router.post('/console/:pipeline/:phase/:app/exec', authMiddleware, async function (req: Request, res: Response) {
    // https://github.com/kubernetes-client/javascript/blob/master/examples/typescript/exec/exec-example.ts
    
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Start a container console'
    const user = 'nobody'

    const podName = req.body.podName;
    const containerName = req.body.containerName;
    const command = req.body.command;

    await req.app.locals.kubero.execInContainer(req.params.pipeline, req.params.phase, req.params.app, podName, containerName, command, user);
    res.send(console);
});

Router.get('/status/pods/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the Pod workload from an Namespace'
    
    req.app.locals.kubero.getPods(req.params.pipeline, req.params.phase, req.params.app)
        .then((result: any) => {
            res.send(result);
        })
        .catch((err: any) => {
            res.status(500).send(err);
        });
});