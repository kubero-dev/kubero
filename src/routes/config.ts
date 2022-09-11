import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';

const Router = express.Router();
export const RouterConfig = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();


import debug from 'debug';
debug('app:routes')

Router.get('/config', authMiddleware, async function (req: Request, res: Response) {
    let debug: any = {};
    debug['pipelineState'] = req.app.locals.kubero.getPipelineStateList();
    debug['appStateList'] = await req.app.locals.kubero.getAppStateList();
    res.send(debug);
});

Router.get('/config/podsize', authMiddleware, async function (req: Request, res: Response) {
    res.send(await req.app.locals.kubero.getPodSizeList());
});

Router.get('/config/buildpacks', authMiddleware, async function (req: Request, res: Response) {
    res.send(await req.app.locals.kubero.getBuildpacks());
});

Router.get('/config/k8s/context', authMiddleware, async function (req: Request, res: Response) {
    res.send(req.app.locals.kubero.getContexts());
});

Router.get('/config/repositories', authMiddleware, async function (req: Request, res: Response) {
    res.send(await req.app.locals.kubero.getRepositories());
});
