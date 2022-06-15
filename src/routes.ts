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

Router.delete('/pipelines/:name', async function (req: Request, res: Response) {
    let pipelines = await req.app.locals.keroku.deletePipeline(req.params.name);
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
        webreplicas: req.body.webreplicas,
        workerreplicas: req.body.workerreplicas
    };

    let app = new App(appconfig);
    
    req.app.locals.keroku.newApp(app, req.body.envvars);
    res.send("new");
});

Router.get('/pipelines/:name/apps', async function (req: Request, res: Response) {
    let apps = await req.app.locals.keroku.listApps(req.params.name);
    res.send(apps);
});