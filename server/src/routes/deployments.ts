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

    console.log('deployments');

    const deployments = await req.app.locals.deployments.getDeployments(
        req.params.pipeline,
        req.params.phase,
        req.params.app
    );
    res.send(deployments)
    //res.send('ok');
});

Router.get('/deployments/:pipeline/:phase/:app/:container/log', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get deployments logs for a specific app'
    // #swagger.description = 'Get deployments logs for a specific app'
    // #swagger.parameters['pipeline'] = { description: 'Pipeline name' }
    // #swagger.parameters['phase'] = { description: 'Phase name' }
    // #swagger.parameters['app'] = { description: 'App name' }

    const deployments = await req.app.locals.deployments.getBuildLogs(
        req.params.pipeline,
        req.params.phase,
        req.params.app,
        req.params.container
    );
    res.send(deployments);
});

Router.post('/deployments/build/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Build a specific app'
    // #swagger.description = 'Build a specific app'
    // #swagger.parameters['pipeline'] = { description: 'Pipeline name' }
    // #swagger.parameters['phase'] = { description: 'Phase name' }
    // #swagger.parameters['app'] = { description: 'App name' }

    const user = auth.getUser(req);
    const deployments = await req.app.locals.deployments.buildImage(
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