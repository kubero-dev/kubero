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
    const user = auth.getUser(req);
    req.app.locals.kubero.newApp(app, user);
    res.send("new");
});

// create a app
Router.post('/apps', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Create a new app'
    const user = auth.getUser(req);
    const app = createApp(req);
    req.app.locals.kubero.newApp(app, user);
    res.send("new");
});

function getVulnerabilityScan(enabled: boolean): any{

    const date = new Date();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes()+1;

    let vulnerabilityscan = {
        enabled: enabled,
        schedule: `${minutes} ${hours} * * *`,
        image: {
            repository: "aquasec/trivy",
            tag: "latest",
        }
    }
    return vulnerabilityscan;
}

function configureBuildpack(req: Request): string {

    if (req.body.buildpack == undefined) {
        return "custom";
    }
    const buildpackList = req.app.locals.kubero.getBuildpacks()

    let selectedBuildpack: any;
    const buildpackConfig = buildpackList.find((element: { name: any; }) => element.name == req.body.buildpack.name);
    if (buildpackConfig == req.body.buildpack) {
        selectedBuildpack = buildpackConfig;
    } else {
        selectedBuildpack = {
            name: "custom",
        };
    }
    return selectedBuildpack.name;
}

function createApp(req: Request) : IApp {

    const selectedBuildpack = configureBuildpack(req);

    let appconfig: IApp = {
        name: req.body.appname,
        pipeline: req.body.pipeline,
        phase: req.body.phase,
        buildpack: selectedBuildpack,
        deploymentstrategy: req.body.deploymentstrategy,
        buildstrategy: req.body.buildstrategy,
        gitrepo: req.body.gitrepo,
        branch: req.body.branch,
        autodeploy: req.body.autodeploy,
        podsize: req.body.podsize,
        autoscale: req.body.autoscale,
        envVars: req.body.envvars,
        extraVolumes: req.body.extraVolumes,
        serviceAccount: req.body.serviceAccount,
        image: {
            containerPort: req.body.image.containerport,
            repository: req.body.image.repository,
            tag: req.body.image.tag || "main",
            pullPolicy: "Always",
            fetch: req.body.image.fetch,
            build: req.body.image.build,
            run: req.body.image.run,
        },
        ingress: req.body.ingress,
        web: req.body.web,
        worker: req.body.worker,
        cronjobs: req.body.cronjobs,
        addons: req.body.addons,
        resources: req.body.podsize.resources,
        vulnerabilityscan: getVulnerabilityScan(req.body.security.vulnerabilityScans),
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

            const element = addon.resourceDefinitions[key];
            if ( !element.metadata.name.startsWith(app.name + "-") ) {
                console.log("renaming " + element.metadata.name + " to " + app.name + "-" + element.metadata.name);
                element.metadata.name = app.name + "-" + element.metadata.name;
            }
        }
    });
}


Router.put('/pipelines/:pipeline/:phase/:app', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Update an app in a specific pipeline'
    // #swagger.parameters['body'] = { in: 'body', description: 'App object', required: true, type: 'object' }
    console.log("serviceAccount: " + JSON.stringify(req.body.serviceAccount));
    const appconfig: IApp = {
        name: req.params.app,
        pipeline: req.params.pipeline,
        phase: req.params.phase,
        buildpack: req.body.buildpack.name,
        deploymentstrategy: req.body.deploymentstrategy,
        buildstrategy: req.body.buildstrategy,
        gitrepo: req.body.gitrepo,
        branch: req.body.branch,
        autodeploy: req.body.autodeploy,
        podsize: req.body.podsize,
        autoscale: req.body.autoscale,
        extraVolumes: req.body.extraVolumes,
        envVars: req.body.envvars,
        serviceAccount: req.body.serviceAccount,
        image: {
            containerPort: req.body.image.containerport,
            repository: req.body.image.repository,
            tag: req.body.image.tag || "latest",
            pullPolicy: "Always",
            fetch: req.body.image.fetch,
            build: req.body.image.build,
            run: req.body.image.run,
        },
        ingress: req.body.ingress,
        web: req.body.web,
        worker: req.body.worker,
        cronjobs: req.body.cronjobs,
        addons: req.body.addons,
        resources: req.body.podsize.resources,
        vulnerabilityscan: getVulnerabilityScan(req.body.security.vulnerabilityScans),
    };
    // WARNING: renaming the addon will cause dataloss !!!
    //normalizeAddonName(appconfig);

    const app = new App(appconfig);

    const user = auth.getUser(req);
    req.app.locals.kubero.updateApp(app, req.body.resourceVersion, user);
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

// Deploy a prebuilt app tag
// Used GET instead of POST to make it easier to use from the CLI
// Not used in the UI yet
Router.get('/cli/apps/:pipeline/:phase/:app/deploy/:tag', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Apps']
    // #swagger.summary = 'Deploy a prebuilt app tag'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */

    req.app.locals.kubero.deployApp(req.params.pipeline, req.params.phase, req.params.app, req.params.tag);
    res.send("deployed");
});
