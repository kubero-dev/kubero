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

    let pipeline = req.params.pipeline;
    let phase = req.params.phase;
    let app = req.params.app;

    let ret = await req.app.locals.kubero.startScan(pipeline, phase, app);
    let retXXXX = [
        pipeline,
        phase,
        app
    ]
    res.send(ret);

});
