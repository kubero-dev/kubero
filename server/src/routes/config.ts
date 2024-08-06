import express, { NextFunction, Request, Response } from 'express';
import { Auth } from '../modules/auth';

const Router = express.Router();
export const RouterConfig = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();
export const bearerMiddleware = auth.getBearerMiddleware();


import debug from 'debug';
debug('app:routes')

Router.get('/config', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the config'
    let debug: any = {};
    debug['pipelineState'] = req.app.locals.kubero.getPipelineStateList();
    debug['appStateList'] = await req.app.locals.kubero.getAppStateList();
    res.send(debug);
});

Router.get('/cli/config/podsize', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Config']
    // #swagger.summary = 'Get the podsize list'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    res.send(await req.app.locals.kubero.getPodSizeList());
});

Router.get('/config/podsize', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the podsize list'
    res.send(await req.app.locals.kubero.getPodSizeList());
});


Router.get('/cli/config/buildpacks', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Config']
    // #swagger.summary = 'Get the buildpacks list'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    res.send(await req.app.locals.kubero.getBuildpacks());
});

Router.get('/config/buildpacks', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the buildpacks list'
    res.send(await req.app.locals.kubero.getBuildpacks());
});


Router.get('/cli/config/k8s/context', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Config']
    // #swagger.summary = 'Get the available Kubernetes contexts'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    res.send(req.app.locals.kubero.getContexts());
});

Router.get('/config/k8s/context', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the available k8s context list'
    res.send(req.app.locals.kubero.getContexts());
});


Router.get('/cli/config/repositories', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Config']
    // #swagger.summary = 'Get the available repositories'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    res.send(await req.app.locals.kubero.getRepositories());
});

Router.get('/config/repositories', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the available repositories'
    res.send(await req.app.locals.kubero.getRepositories());
});


Router.get('/config/storageclasses', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the available storageclasses'
    res.send(await req.app.locals.kubero.getStorageglasses());
});

Router.get('/config/ingressclasses', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the available ingresclasses'
    res.send(await req.app.locals.kubero.getIngressClasses());
});

Router.get('/config/catalogs', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a list of available catalogs'
    res.send(await req.app.locals.kubero.getTemplateConfig());
});

Router.get('/config/clusterissuers', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a list of available clusterissuers'
    const ret = {
        id: await req.app.locals.kubero.getClusterIssuer() || 'letsencrypt-prod',
    }
    res.send(ret);
});