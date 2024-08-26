import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';

export const Router = express.Router();
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();

import debug from 'debug';
//import rateLimit from 'express-rate-limit';
debug('app:routes')

Router.get('/deployments/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get deployments for a specific app'
    // #swagger.description = 'Get deployments for a specific app'
    // #swagger.parameters['pipeline'] = { description: 'Pipeline name' }
    // #swagger.parameters['phase'] = { description: 'Phase name' }
    // #swagger.parameters['app'] = { description: 'App name' }


    const jobs = await req.app.locals.deployments.listBuildjobs(
        req.params.pipeline,
        req.params.phase,
        req.params.app
    );
    res.send(jobs)
    //res.send('ok');
});

Router.post('/deployments/build/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Build a specific app'
    // #swagger.description = 'Build a specific app'
    // #swagger.parameters['pipeline'] = { description: 'Pipeline name' }
    // #swagger.parameters['phase'] = { description: 'Phase name' }
    // #swagger.parameters['app'] = { description: 'App name' }

    const user = auth.getUser(req);
    const deployments = await req.app.locals.deployments.triggerBuildjob(
        req.params.pipeline,
        req.params.phase,
        req.params.app,
        req.body.buildstrategy as string,
        req.body.repository as string,
        req.body.reference as string,
        req.body.dockerfilePath as string,
        user
    );
    res.send(deployments);
});

Router.delete('/deployments/:pipeline/:phase/:app/:buildName', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Delete a specific app'
    // #swagger.description = 'Delete a specific app'
    // #swagger.parameters['pipeline'] = { description: 'Pipeline name' }
    // #swagger.parameters['phase'] = { description: 'Phase name' }
    // #swagger.parameters['app'] = { description: 'App name' }

    const user = auth.getUser(req);
    const job = await req.app.locals.deployments.deleteBuildjob(
        req.params.pipeline,
        req.params.phase,
        req.params.app,
        req.params.buildName,
        user
    );
    res.send(job);
});

Router.get('/deployments/:pipeline/:phase/:app/:build/:container/history', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get logs for a specific app'
    // #swagger.description = 'Get logs for a specific app'
    // #swagger.parameters['pipeline'] = { description: 'Pipeline name' }
    // #swagger.parameters['phase'] = { description: 'Phase name' }
    // #swagger.parameters['app'] = { description: 'App name' }

    const logs = await req.app.locals.deployments.getBuildLogs(
        req.params.pipeline,
        req.params.phase,
        req.params.app,
        req.params.build,
        req.params.container
    );
    res.send(logs);
});