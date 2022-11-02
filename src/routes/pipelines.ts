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
    console.log(req.body)
    let con = await req.app.locals.kubero.connectRepo(req.body.repoprovider.toLowerCase(), req.body.repositoryURL);
    console.log(con)
    let pipeline: IPipeline = {
        name: req.body.pipelineName,
        phases: req.body.phases,
        buildpack: req.body.buildpack,
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

// create a pipeline
Router.post('/pipelines',authMiddleware, async function (req: Request, res: Response) {
    let pipeline: IPipeline = {
        name: req.body.pipelineName,
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

// get a list of pipelines
Router.get('/cli/pipelines', bearerMiddleware, async function (req: Request, res: Response) {
    let pipelines = await req.app.locals.kubero.listPipelines();
    res.send(pipelines);
});

// get a list of pipelines
Router.get('/pipelines', authMiddleware, async function (req: Request, res: Response) {
    let pipelines = await req.app.locals.kubero.listPipelines();
    res.send(pipelines);
});

// get a pipeline
Router.get('/cli/pipelines/:pipeline', bearerMiddleware, async function (req: Request, res: Response) {
    let pipeline = await req.app.locals.kubero.getPipeline(req.params.pipeline);
    res.send(pipeline);
});

// get a pipeline
Router.get('/pipelines/:pipeline', authMiddleware, async function (req: Request, res: Response) {
    let pipeline = await req.app.locals.kubero.getPipeline(req.params.pipeline);
    res.send(pipeline);
});

// delete a pipeline
Router.delete('/pipelines/:pipeline', authMiddleware, async function (req: Request, res: Response) {
    await req.app.locals.kubero.deletePipeline(encodeURI(req.params.pipeline));
    res.send("pipeline "+encodeURI(req.params.pipeline)+" deleted");
});


// delete a pipeline
Router.delete('/cli/pipelines/:pipeline', bearerMiddleware, async function (req: Request, res: Response) {
    await req.app.locals.kubero.deletePipeline(encodeURI(req.params.pipeline));
    res.send("pipeline "+encodeURI(req.params.pipeline)+" deleted");
});

// delete an app
Router.delete('/pipelines/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    await req.app.locals.kubero.deleteApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send("deleted");
});

// update a app in a specific pipeline
Router.put('/pipelines/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {

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
        cronjobs: req.body.cronjobs,
        addons: req.body.addons,
        resources: req.body.podsize.resources,
    };

    let app = new App(appconfig);

    req.app.locals.kubero.updateApp(app, req.body.resourceVersion);

    res.send("updated");
});

// get app details
Router.get('/pipelines/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    let app = await req.app.locals.kubero.getApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send(app.body);
});

// get all apps in a pipeline
Router.get('/pipelines/:pipeline/apps', authMiddleware, async function (req: Request, res: Response) {
    let apps = await req.app.locals.kubero.getPipelineWithApps(req.params.pipeline);
    res.send(apps);
});

//restart app
Router.get('/pipelines/:pipeline/:phase/:app/restart', authMiddleware, async function (req: Request, res: Response) {
    req.app.locals.kubero.restartApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send("restarted");
});