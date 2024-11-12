import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';
import axios from 'axios';
import YAML from 'yaml'

export const Router = express.Router();
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();
export const bearerMiddleware = auth.getBearerMiddleware();

// load a specific service from github repo
Router.get('/templates/:template', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a specific template'
    // #swagger.description = 'Get a specific template from a catalog'
    // #swagger.parameters['template'] = { description: 'A base64 encoded URL', type: 'string' }

    // decode the base64 encoded URL
    const templateUrl = Buffer.from(req.params.template, 'base64').toString('ascii');

    const template = await axios.get(templateUrl)
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
