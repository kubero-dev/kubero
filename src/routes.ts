import express, { Express, Request, Response } from 'express';
import { IApp, IPipeline } from './types';
import { App } from './types/application';

export const Router = express.Router();

Router.get('/config', async function (req: Request, res: Response) {
    res.send("config");
});

Router.post('/pipelines', async function (req: Request, res: Response) {
    let pipeline: IPipeline = { 
        name: req.body.pipelineName, 
        phases: req.body.phases,
        reviewapps: req.body.reviewapps,
        github: req.body.github
    }; 
    req.app.locals.keroku.newPipeline(pipeline);
    res.send("new");
});

Router.get('/pipelines', async function (req: Request, res: Response) {
    let pipelines = await req.app.locals.keroku.listPipelines();
    res.send(pipelines);
});

Router.delete('/pipelines/:pipeline', async function (req: Request, res: Response) {
    let pipelines = await req.app.locals.keroku.deletePipeline(req.params.pipeline);
    res.send(pipelines);
});

Router.post('/apps', async function (req: Request, res: Response) {
    
    let appconfig: IApp = {
        name: req.body.appname,
        pipeline: req.body.pipeline,
        phase: req.body.phase,
        gitrepo: req.body.gitrepo,
        branch: req.body.branch,
        autodeploy: req.body.autodeploy,
        domain: req.body.domain,
        podsize: req.body.podsize,
        autoscale: req.body.autoscale,
        envVars: req.body.envvars,
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
    };

    let app = new App(appconfig);
    
    req.app.locals.keroku.newApp(app);
    res.send("new");
});

// delete an app
Router.delete('/pipelines/:pipeline/:phase/:app', async function (req: Request, res: Response) {
    await req.app.locals.keroku.deleteApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send("deleted");
});

// create a new app in a specific pipeline
Router.put('/pipelines/:pipeline/:phase/:app', async function (req: Request, res: Response) {

    let appconfig: IApp = {
        name: req.params.app,
        pipeline: req.params.pipeline,
        phase: req.params.phase,

        gitrepo: req.body.gitrepo,
        branch: req.body.branch,
        autodeploy: req.body.autodeploy,
        domain: req.body.domain,
        podsize: req.body.podsize,
        autoscale: req.body.autoscale,
        envVars: req.body.envvars,
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
    };

    let app = new App(appconfig);
    
    req.app.locals.keroku.updateApp(app, req.body.envvars, req.body.resourceVersion);

    res.send("updated");
});

// get app details
Router.get('/pipelines/:pipeline/:phase/:app', async function (req: Request, res: Response) {
    let app = await req.app.locals.keroku.getApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send(app.body); 
});

// get all apps in a pipeline
Router.get('/pipelines/:pipeline/apps', async function (req: Request, res: Response) {
    let apps = await req.app.locals.keroku.listApps(req.params.pipeline);
    res.send(apps);
});

//restart app
Router.get('/pipelines/:pipeline/:phase/:app/restart', async function (req: Request, res: Response) {
    req.app.locals.keroku.restartApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send("restarted"); 
});

// connect pipeline with github
Router.post('/github/connect', async function (req: Request, res: Response) {
    let con = await req.app.locals.keroku.connectPipeline(req.body.gitrepo);
    res.send(con);
});

// connect pipeline with github
Router.get('/apps', async function (req: Request, res: Response) {
    res.send(await req.app.locals.keroku.getAppStateList());
});

// get github webhook events
Router.post('/webhooks/github', async function (req: Request, res: Response) {
    let event = req.headers['x-github-event']
    let delivery = req.headers['x-github-delivery']
    //let hookId = req.headers['x-github-hook-id']
    let signature = req.headers['x-hub-signature-256']
    let body = req.body

    req.app.locals.keroku.handleGithubWebhook(event, delivery, signature, body);
    res.send("ok");
});

// get a list of addons
Router.get('/addons', async function (req: Request, res: Response) {
    //res.send('ok');
    res.send(await req.app.locals.addons.getAddonsList())
});