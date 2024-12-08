import express, { NextFunction, Request, Response } from 'express';
import { Auth } from '../modules/auth';

const Router = express.Router();
export const RouterConfig = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();
export const bearerMiddleware = auth.getBearerMiddleware();


import debug from 'debug';
import { spawn } from 'child_process';
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

Router.get('/config/registry', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the default registry list'
    res.send(await req.app.locals.settings.getDefaultRegistry());
});

Router.post('/config/k8s/kubeconfig/validate', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Validate the kubeconfig'
    // #swagger.description = 'Validate the kubeconfig for setup process'
    // #swagger.parameters['kubeconfig'] = { description: 'Kubeconfig' }
    const kubeconfig = req.body.kubeconfig;
    const kubeContext = req.body.context;
    const result = await req.app.locals.settings.validateKubeconfig(kubeconfig, kubeContext);
    res.send(result);
});

Router.post('/config/setup/save', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Save the initial Kubero configuration'
    // #swagger.description = 'Save the initial Kubero configuration'
    // #swagger.parameters['KUBECONFIG_BASE64'] = { description: 'Base 64 encoded Kubeconfig' }
    // #swagger.parameters['KUBERO_CONTEXT'] = { description: 'Kubernetes context' }
    // #swagger.parameters['KUBERO_NAMESPACE'] = { description: 'Kubero namespace' }
    // #swagger.parameters['KUBERO_SESSION_KEY'] = { description: 'Kubero UI session key' }
    const kubeconfigBase64 = req.body.KUBECONFIG_BASE64;
    const kubeContext = req.body.KUBERO_CONTEXT;
    const kuberoNamespace = req.body.KUBERO_NAMESPACE;
    const KuberoSessionKey = req.body.KUBERO_SESSION_KEY;
    const kuberoWebhookSecret = req.body.KUBERO_WEBHOOK_SECRET;

    // Base64 decode the kubeconfig
    const kubeconfigDecoded = Buffer.from(kubeconfigBase64, 'base64').toString('utf-8');
    const resultValidation = await req.app.locals.settings.validateKubeconfig(kubeconfigDecoded, kubeContext);
    if (resultValidation.valid === false) {
        res.send(resultValidation);
        return;
    }

    const resultUpdateConfig = await req.app.locals.settings.updateRunningConfig(kubeconfigBase64, kubeContext, kuberoNamespace, KuberoSessionKey, kuberoWebhookSecret);

    req.app.locals.kubero.updateState();

    res.send(resultUpdateConfig);
});

Router.get('/config/setup/check/:component', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Check if a specific component is installed'
    // #swagger.parameters['component'] = { description: 'Component to check' }
    const component = req.params.component;
    const result = await req.app.locals.settings.checkComponent(component);
    res.send(result);
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