import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';
import { IApp, IPipeline } from '../types';
import { App } from '../modules/application';
import { Webhooks } from '@octokit/webhooks';

const Router = express.Router();
export const RouterPipelines = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();
export const bearerMiddleware = auth.getBearerMiddleware();

Router.post('/cli/pipelines',bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Pipeline']
    // #swagger.summary = 'Create a new pipeline'
    // #swagger.parameters['body'] = { in: 'body', description: 'Pipeline object', required: true, type: 'object' }
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */

    let con = await req.app.locals.kubero.connectRepo(
        req.body.git.repository.provider.toLowerCase(),
        req.body.git.repository.ssh_url);

    const buildpackList = req.app.locals.kubero.getBuildpacks()

    const selectedBuildpack = buildpackList.find((element: { name: any; }) => element.name == req.body.buildpack.name);

    let pipeline: IPipeline = {
        name: req.body.pipelineName,
        domain: req.body.domain,
        phases: req.body.phases,
        buildpack: selectedBuildpack,
        reviewapps: req.body.reviewapps,
        git: {
            keys: con.keys.data,
            webhook: con.webhook.data,
            repository: con.repository.data
        },
        dockerimage: req.body.dockerimage,
        deploymentstrategy: req.body.deploymentstrategy,
    };
    req.app.locals.kubero.newPipeline(pipeline);
    res.send(pipeline);
});

Router.post('/pipelines',authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Create a new pipeline'
    // #swagger.parameters['body'] = { in: 'body', description: 'Pipeline object', required: true, type: 'object' }
    let pipeline: IPipeline = {
        name: req.body.pipelineName,
        domain: req.body.domain,
        phases: req.body.phases,
        buildpack: req.body.buildpack,
        reviewapps: req.body.reviewapps,
        git: req.body.git,
        dockerimage: req.body.dockerimage,
        deploymentstrategy: req.body.deploymentstrategy,
    };
    req.app.locals.kubero.newPipeline(pipeline);
    res.send("new");
});

Router.get('/cli/pipelines', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Pipeline']
    // #swagger.summary = 'Get a list of available pipelines'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    let pipelines = await req.app.locals.kubero.listPipelines();
    res.send(pipelines);
});

Router.get('/pipelines', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a list of available pipelines'
    let pipelines = await req.app.locals.kubero.listPipelines()
    .catch((err: any) => {
        console.log(err)
    });
    res.send(pipelines);
});

Router.get('/cli/pipelines/:pipeline', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Pipeline']
    // #swagger.summary = 'Get a pipeline'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    let pipeline = await req.app.locals.kubero.getPipeline(req.params.pipeline);
    res.send(pipeline);
});

Router.get('/pipelines/:pipeline', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a pipeline'
    let pipeline = await req.app.locals.kubero.getPipeline(req.params.pipeline);
    res.send(pipeline);
});

Router.delete('/pipelines/:pipeline', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Delete a pipeline'
    await req.app.locals.kubero.deletePipeline(encodeURI(req.params.pipeline));
    res.send("pipeline "+encodeURI(req.params.pipeline)+" deleted");
});

Router.delete('/cli/pipelines/:pipeline', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Pipeline']
    // #swagger.summary = 'Delete a pipeline'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    await req.app.locals.kubero.deletePipeline(encodeURI(req.params.pipeline));
    res.send("pipeline "+encodeURI(req.params.pipeline)+" deleted");
});

Router.delete('/pipelines/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Delete an app'
    await req.app.locals.kubero.deleteApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send("deleted");
});

Router.delete('/cli/pipelines/:pipeline/:phase/:app', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Pipeline']
    // #swagger.summary = 'Delete an app'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    await req.app.locals.kubero.deleteApp(req.params.pipeline, req.params.phase, req.params.app);

    // sanityze params
    req.params.pipeline = encodeURI(req.params.pipeline);
    req.params.phase = encodeURI(req.params.phase);
    req.params.app = encodeURI(req.params.app);
    res.send("deleted "+req.params.pipeline+" "+req.params.phase+" "+req.params.app);
});

Router.put('/pipelines/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Update an app in a specific pipeline'
    // #swagger.parameters['body'] = { in: 'body', description: 'App object', required: true, type: 'object' }

    let appconfig: IApp = {
        name: req.params.app,
        pipeline: req.params.pipeline,
        phase: req.params.phase,
        buildpack: req.body.buildpack.name,
        deploymentstrategy: req.body.deploymentstrategy,
        gitrepo: req.body.gitrepo,
        branch: req.body.branch,
        autodeploy: req.body.autodeploy,
        domain: req.body.domain,
        podsize: req.body.podsize,
        autoscale: req.body.autoscale,
        envVars: req.body.envvars,
        image: {
            containerPort: req.body.image.containerport,
            repository: req.body.image.repository,
            tag: req.body.image.tag || "main",
            pullPolicy: "Always",
            fetch: req.body.image.fetch,
            build: req.body.image.build,
            run: req.body.image.run,
        },
        web: req.body.web,
        worker: req.body.worker,
        /*
        web: {
            replicaCount: req.body.webreplicas,
            autoscaling: {
                minReplicas: req.body.webreplicasrange[0] || 1,
                maxReplicas: req.body.webreplicasrange[1] || 0,
                targetCPUUtilizationPercentage: req.body.webtargetCPUUtilizationPercentage || 80,
                targetMemoryUtilizationPercentage: req.body.webtargetMemoryUtilizationPercentage || 0
            }
        },
        worker: {
            replicaCount: req.body.workerreplicas,
            autoscaling: {
                minReplicas: req.body.workerreplicasrange[0] || 0,
                maxReplicas: req.body.workerreplicasrange[1] || 0,
                targetCPUUtilizationPercentage: req.body.workertargetCPUUtilizationPercentage || 80,
                targetMemoryUtilizationPercentage: req.body.workertargetMemoryUtilizationPercentage || 0
            }
        },
        */
        cronjobs: req.body.cronjobs,
        addons: req.body.addons,
        resources: req.body.podsize.resources,
    };

    let app = new App(appconfig);

    req.app.locals.kubero.updateApp(app, req.body.resourceVersion);

    res.send("updated");
});

Router.get('/cli/pipelines/:pipeline/:phase/:app', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Pipeline']
    // #swagger.summary = 'Get app details'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    let app = await req.app.locals.kubero.getApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send(app.body);
});

Router.get('/pipelines/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get app details'
    let app = await req.app.locals.kubero.getApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send(app.body);
});

Router.get('/cli/pipelines/:pipeline/apps', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Pipeline']
    // #swagger.summary = 'Get all apps in a pipeline'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    let apps = await req.app.locals.kubero.getPipelineWithApps(req.params.pipeline);
    res.send(apps);
});

Router.get('/pipelines/:pipeline/apps', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get all apps in a pipeline'
    let apps = await req.app.locals.kubero.getPipelineWithApps(req.params.pipeline);
    res.send(apps);
});

Router.get('/pipelines/:pipeline/:phase/:app/restart', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Restart an app'
    req.app.locals.kubero.restartApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send("restarted");
});