import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';
import { IKubectlApp, IgitLink } from '../types';
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

    const con = await req.app.locals.kubero.connectRepo(
                        req.body.git.repository.provider.toLowerCase(),
                        req.body.git.repository.ssh_url);

    let git: IgitLink = {
        keys: {
            priv: "Zm9v",
            pub: "YmFy"
        },
        repository: {
            admin: false,
            clone_url: "",
            ssh_url: "",
        },
        webhook: {}
    };

    if (con.error) {
        console.log("ERROR: connecting Gitrepository", con.error);
    } else {
        git.keys = con.keys.data,
        git.webhook = con.webhook.data,
        git.repository = con.repository.data
    }

    const buildpackList = req.app.locals.kubero.getBuildpacks()

    const selectedBuildpack = buildpackList.find((element: { name: any; }) => element.name == req.body.buildpack.name);

    const pipeline: IPipeline = {
        name: req.body.pipelineName,
        domain: req.body.domain,
        phases: req.body.phases,
        buildpack: selectedBuildpack,
        reviewapps: req.body.reviewapps,
        git: git,
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


Router.put('/pipelines/:pipeline',authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Edit a pipeline'
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
    req.app.locals.kubero.updatePipeline(pipeline, req.body.resourceVersion);
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
    try {
        await req.app.locals.kubero.deleteApp(req.params.pipeline, req.params.phase, req.params.app);
        res.send("pipeline "+encodeURI(req.params.pipeline)+" deleted");
    } catch (error) {
        console.log(error);
        res.status(503);
        res.send("delete failed");
    }
});

Router.delete('/pipelines/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Delete an app'
    try {
        await req.app.locals.kubero.deleteApp(req.params.pipeline, req.params.phase, req.params.app);
    
        // sanityze params
        const pipeline = encodeURI(req.params.pipeline);
        const phase = encodeURI(req.params.phase);
        const app = encodeURI(req.params.app);
        const response = {
            message: "deleted "+pipeline+" "+phase+" "+app,
            pipeline: pipeline,
            phase: phase,
            app: app
        };
        res.send(response);
    } catch (error) {
        console.log(error);
        res.status(503);
        res.send("delete failed");
    }
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
    try {
        await req.app.locals.kubero.deleteApp(req.params.pipeline, req.params.phase, req.params.app);
    
        // sanityze params
        const pipeline = encodeURI(req.params.pipeline);
        const phase = encodeURI(req.params.phase);
        const app = encodeURI(req.params.app);
        const response = {
            message: "deleted "+pipeline+" "+phase+" "+app,
            pipeline: pipeline,
            phase: phase,
            app: app
        };
        res.send(response);
    } catch (error) {
        console.log(error);
        res.status(503);
        res.send("delete failed");
    }
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
    try {
        let app = await req.app.locals.kubero.getApp(req.params.pipeline, req.params.phase, req.params.app);
        if (app == undefined) {
            res.status(404);
            res.send("not found");
            return;
        }
        // TODO: the response should be sanitised the same way as in the the UI
        res.send(app.body);
    } catch (error) {
        console.log(error);
        res.status(404);
        res.send("not found");
    }
});

Router.get('/pipelines/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get app details'
    try {
        let app = await req.app.locals.kubero.getApp(req.params.pipeline, req.params.phase, req.params.app);
        if (app == undefined) {
            res.status(404);
            res.send("not found");
            return;
        }

        const a = new App(app.body.spec as IApp);

        res.send({
            resourceVersion: app.body.metadata.resourceVersion,
            spec: a
        });
    } catch (error) {
        console.log(error);
        res.status(404);
        res.send("not found");
    }
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
    try {
        let apps = await req.app.locals.kubero.getPipelineWithApps(req.params.pipeline);
        res.send(apps);
    } catch (error) {
        console.log(error);
        res.status(404);
        res.send("not found");
    }
});

Router.get('/pipelines/:pipeline/apps', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get all apps in a pipeline'
    try {
        let apps = await req.app.locals.kubero.getPipelineWithApps(req.params.pipeline);
        res.send(apps);
    } catch (error) {
        console.log(error);
        res.status(404);
        res.send("not found");
    }
});

Router.get('/pipelines/:pipeline/:phase/:app/restart', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Restart an app'
    try {
        await req.app.locals.kubero.restartApp(req.params.pipeline, req.params.phase, req.params.app);
        res.send("restarted");
    } catch (error) {
        console.log(error);
        res.status(503);
        res.send("restart failed");
    }
});