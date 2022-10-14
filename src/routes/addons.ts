import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';
import { IAddonMinimal } from '../modules/addons';

const Router = express.Router();
export const RouterAddons = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();


// get a list of addons
Router.get('/addons', authMiddleware, async function (req: Request, res: Response) {
    //res.send('ok');
    let addonslist = await req.app.locals.addons.getAddonsList();
    res.send(addonslist)
});

// get a list of addons
Router.get('/addons/operators', authMiddleware, async function (req: Request, res: Response) {
    //res.send('ok');
    let operatorslist = await req.app.locals.addons.getOperatorsList();
    res.send(operatorslist)
});