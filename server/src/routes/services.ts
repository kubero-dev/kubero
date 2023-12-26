import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';
import axios from 'axios';
import YAML from 'yaml'

export const Router = express.Router();
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();
export const bearerMiddleware = auth.getBearerMiddleware();
/*
// load all services from github repo
Router.get('/services', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get all services'

    axios.get('https://raw.githubusercontent.com/kubero-dev/kubero/main/services/index.yaml')
});


// load a specific service from github repo
Router.get('/services/:name', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a specific service'
    // #deprecated = true // since v1.11.0

    const serviceName = req.params.name.replace(/[^\w.-]+/g, '');

    const service = await axios.get('https://raw.githubusercontent.com/kubero-dev/kubero/main/services/' + serviceName + '/app.yaml')
    .catch((err) => {
        res
            .status(500)
            .send(err);
    });
    if (service) {
        const ret = YAML.parse(service.data);
        res.send(ret.spec);
    }
});
*/

// load a specific service from github repo
Router.get('/templates/:catalogId/:template', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a specific template'

    const templateName = req.params.template.replace(/[^\w.-]+/g, '');
    const templateBasePath = await req.app.locals.kubero.getTemplateBasePath(parseInt(req.params.catalogId));

    const template = await axios.get(templateBasePath + templateName + '/app.yaml')
    .catch((err) => {
        res
            .status(500)
            .send(err);
    });
    if (template) {
        const ret = YAML.parse(template.data);
        res.send(ret.spec);
    }
});

// load a specific service from github repo
Router.get('/templates/:catalogId', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a specific template'
    
    const templateBasePath = await req.app.locals.kubero.getTemplateBasePath(parseInt(req.params.catalogId));

    
    axios.get(templateBasePath + '/index.yaml')
});

