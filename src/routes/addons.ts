import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';
import { IAddonMinimal } from '../modules/addons';

const Router = express.Router();
export const RouterAddons = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();
export const bearerMiddleware = auth.getBearerMiddleware();



// get a list of addons
Router.get('/cli/addons', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Addons']
    // #swagger.summary = 'Get a list of available addons'
    /* #swagger.security = [{
                "bearerAuth": {
                    "type": 'http',
                    "scheme": 'bearer',
                    "bearerFormat": 'JWT',
                }
        }] */
    let addonslist = await req.app.locals.addons.getAddonsList();
    res.send(addonslist)
});

// get a list of addons
Router.get('/addons', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a list of available addons'
    let addonslist = await req.app.locals.addons.getAddonsList();
    res.send(addonslist)
});

Router.get('/addons/operators', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a list of installed operators'
    let operatorslist = await req.app.locals.addons.getOperatorsList();
    res.send(operatorslist)
});