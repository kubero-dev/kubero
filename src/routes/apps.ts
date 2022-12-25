import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';
import { IApp } from '../types';
import { App } from '../modules/application';

const Router = express.Router();
export const RouterApps = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();
export const bearerMiddleware = auth.getBearerMiddleware();

// create a app with CLI
Router.post('/cli/apps', bearerMiddleware, async function (req: Request, res: Response) {
  // #swagger.tags = ['CLI']

    const app = createApp(req);
    req.app.locals.kubero.newApp(app);
    res.send("new");
});

// create a app
Router.post('/apps', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Apps']
    const app = createApp(req);
    req.app.locals.kubero.newApp(app);
    res.send("new");
});

function createApp(req: Request,) : IApp {
    const buildpackList = req.app.locals.kubero.getBuildpacks()

    let selectedBuildpack: any;
    const buildpackConfig = buildpackList.find((element: { name: any; }) => element.name == req.body.buildpack.name);
    if (buildpackConfig == req.body.buildpack) {
        selectedBuildpack = buildpackConfig;
    } else {
        selectedBuildpack = {
            name: "custom",
            fetch: req.body.buildpack.fetch,
            build: req.body.buildpack.build,
            run: req.body.buildpack.run,
        };
    }

    let appconfig: IApp = {
        name: req.body.appname,
        pipeline: req.body.pipeline,
        phase: req.body.phase,
        buildpack: selectedBuildpack.name,
        deploymentstrategy: req.body.deploymentstrategy,
        gitrepo: req.body.gitrepo,
        branch: req.body.branch,
        autodeploy: req.body.autodeploy,
        domain: req.body.domain,
        ssl: req.body.ssl,
        podsize: req.body.podsize,
        autoscale: req.body.autoscale,
        envVars: req.body.envvars,
        image: {
            containerPort: req.body.image.containerport,
            repository: req.body.image.repository,
            tag: req.body.image.tag || "main",
            pullPolicy: "Always",
            fetch: selectedBuildpack.fetch,
            build: selectedBuildpack.build,
            run: selectedBuildpack.run,
        },
        web: req.body.web,
        worker: req.body.worker,
        cronjobs: req.body.cronjobs,
        addons: req.body.addons,
        resources: req.body.podsize.resources,
    };

    let app = new App(appconfig);
    return app;
}

// list all availabe apps
Router.get('/cli/apps', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['CLI']
    res.send(await req.app.locals.kubero.getAppStateList());
});

// list all availabe apps
Router.get('/apps', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Apps']
    res.send(await req.app.locals.kubero.getAppStateList());
});
