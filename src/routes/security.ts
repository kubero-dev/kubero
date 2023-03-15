import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';

export const Router = express.Router();
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();
export const bearerMiddleware = auth.getBearerMiddleware();

// get the settings
Router.get('/security/:pipeline/:phase/:app/scan', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Scan an app for vulnerabilities'
    // #swagger.description = 'Scan an app for vulnerabilities'
    // #swagger.parameters['pipeline'] = { description: 'Pipeline name' }
    // #swagger.parameters['phase'] = { description: 'Phase name' }
    // #swagger.parameters['app'] = { description: 'App name' }

    const pipeline = req.params.pipeline;
    const phase = req.params.phase;
    const app = req.params.app;

    const ret = await req.app.locals.kubero.startScan(pipeline, phase, app);

    res.send(ret);

});
Router.get('/security/:pipeline/:phase/:app/scan/result', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get scan result (vulnerabilities) from a app'
    // #swagger.description = 'Get scan result (vulnerabilities) from a app'
    // #swagger.parameters['pipeline'] = { description: 'Pipeline name' }
    // #swagger.parameters['phase'] = { description: 'Phase name' }
    // #swagger.parameters['app'] = { description: 'App name' }
    // #swagger.parameters['logdetails'] = { description: 'Add Logs' }

    const pipeline = req.params.pipeline;
    const phase = req.params.phase;
    const app = req.params.app;
    const logdetails = req.query.logdetails

    const ret = await req.app.locals.kubero.getScanResult(pipeline, phase, app, logdetails);

    res.send(ret);

});