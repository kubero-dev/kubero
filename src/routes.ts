import express, { Express, Request, Response } from 'express';
import { pipeline } from 'stream';
import { IApp, IPipeline } from './types';
import { App } from './types/application';

export const Router = express.Router();

Router.get('/config', async function (req: Request, res: Response) {
    res.send("config");
});

Router.post('/pipelines', async function (req: Request, res: Response) {
    let pipeline: IPipeline = { 
        name: req.body.appname, 
        phases: req.body.phases,
        reviewapps: req.body.reviewapps
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
        webreplicas: req.body.webreplicas,
        workerreplicas: req.body.workerreplicas,
        webreplicasrange: req.body.webreplicasrange,
        workerreplicasrange: req.body.workerreplicasrange
    };

    let app = new App(appconfig);
    
    req.app.locals.keroku.newApp(app, req.body.envvars);
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
        webreplicas: req.body.webreplicas,
        workerreplicas: req.body.workerreplicas,
        webreplicasrange: req.body.webreplicasrange,
        workerreplicasrange: req.body.workerreplicasrange
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