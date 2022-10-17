import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';
import { IApp } from '../types';
import { App } from '../modules/application';

const Router = express.Router();
export const RouterApps = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();

// create a app
Router.post('/apps', authMiddleware, async function (req: Request, res: Response) {

    let appconfig: IApp = {
        name: req.body.appname,
        pipeline: req.body.pipeline,
        phase: req.body.phase,
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

    req.app.locals.kubero.newApp(app);
    res.send("new");
});

// list all availabe apps
Router.get('/apps', authMiddleware, async function (req: Request, res: Response) {
    res.send(await req.app.locals.kubero.getAppStateList());
});
