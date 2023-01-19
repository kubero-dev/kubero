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
    // #swagger.tags = ['Apps']
    // #swagger.summary = 'Create a new app'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
        }],
        #swagger.requestBody = {
            required: true,
            "@content": {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                example: "myapp"
                            },
                            pipeline: {
                                type: "string",
                                example: "example"
                            },
                            phase: {
                                type: "string",
                                example: "Test"
                            },
                            buildpack: {
                                type: "string",
                                example: "NodeJS"
                            },
                            deploymentstrategy: {
                                type: "string"
                            },
                            gitrepo: {
                                type: "object",
                            },
                            branch: {
                                type: "string",
                                example: "main"
                            },
                            autodeploy: {
                                type: "boolean"
                            },
                            domain: {
                                type: "string",
                                example: "myapp.lacolhost.com"
                            },
                            ssl: {
                                type: "boolean"
                            },
                            podsize: {
                                type: "string",
                                example: "small"
                            },
                            autoscale: {
                                type: "boolean"
                            },
                            envVars: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: {
                                            type: "string",
                                            example: "myenvvar"
                                        },
                                        value: {
                                            type: "string",
                                            example: "myvalue"
                                        }
                                    }
                                }
                            },
                            image: {
                                type: "object",
                                properties: {
                                    containerPort: {
                                        type: "number",
                                        example: 8080
                                    },
                                    repository: {
                                        type: "string",
                                    },
                                    tag: {
                                        type: "string",
                                        example: "latest"
                                    },
                                    fetch: {
                                        type: "object",
                                    },
                                    build: {
                                        type: "object",
                                    },
                                    run: {
                                        type: "object",
                                    }
                                }
                            },
                            addons: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: {
                                            type: "string",
                                            example: "myaddon"
                                        },
                                        version: {
                                            type: "string",
                                            example: "1.0.0"
                                        },
                                        config: {
                                            type: "object"
                                        }
                                    }
                                }
                            }
                        },
                        required: ["name", "pipeline", "phase", "buildpack",  "branch", "autodeploy", "domain", "ssl", "podsize"]
                    }
                }
            }
        }
    */


    const app = createApp(req);
    req.app.locals.kubero.newApp(app);
    res.send("new");
});

// create a app
Router.post('/apps', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Create a new app'
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
        extraVolumes: req.body.extraVolumes,
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
    normalizeAddonName(appconfig);

    let app = new App(appconfig);
    return app;
}

// rename addons to match the name of the app
function normalizeAddonName(app: IApp) {
    app.addons.forEach((addon: any) => {
        console.log(addon);
        for (const key in addon.resourceDefinitions) {
            if (addon.resourceDefinitions.hasOwnProperty(key)) {
                const element = addon.resourceDefinitions[key];
                element.metadata.name = app.name + "-" + element.metadata.name;
            }
        }
    });
}


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
        extraVolumes: req.body.extraVolumes,
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
        cronjobs: req.body.cronjobs,
        addons: req.body.addons,
        resources: req.body.podsize.resources,
    };
    normalizeAddonName(appconfig);

    let app = new App(appconfig);

    req.app.locals.kubero.updateApp(app, req.body.resourceVersion);

    res.send("updated");
});

// list all availabe apps
Router.get('/cli/apps', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Apps'']
    // #swagger.summary = 'Get a list of running apps'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    res.send(await req.app.locals.kubero.getAppStateList());
});

// list all availabe apps
Router.get('/apps', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a list of running apps'
    res.send(await req.app.locals.kubero.getAppStateList());
});
