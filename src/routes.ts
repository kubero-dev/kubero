import express, { Express, Request, Response } from 'express';
import { IApp, IPipeline } from './types';

export const Router = express.Router();

Router.get('/config', async function (req: Request, res: Response) {
    res.send("config");
});

Router.post('/pipelines', async function (req: Request, res: Response) {
    let pipeline: IPipeline = { 
        name: req.body.appname, 
        reviewapps: req.body.reviewapps
    }; 
    req.app.locals.keroku.newPipeline(pipeline);
    res.send("new");
});

Router.get('/pipelines', async function (req: Request, res: Response) {
    let apps = await req.app.locals.keroku.listPipelines();
    res.send(apps);
});

Router.delete('/pipelines/:name', async function (req: Request, res: Response) {
    let apps = await req.app.locals.keroku.deletePipeline(req.params.name);
    res.send(apps);
});

Router.post('/apps', async function (req: Request, res: Response) {
    let app: IApp = {
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
    req.app.locals.keroku.newApp(app);
    res.send("new");
});