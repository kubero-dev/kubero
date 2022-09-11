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

// delete an addon
Router.delete('/addons/:pipeline/:phase/:addonID', authMiddleware, async function (req: Request, res: Response) {
    let addon = {
        group: req.body.apiVersion.split('/')[0],
        version: req.body.apiVersion.split('/')[1],
        namespace: req.params.pipeline + "-" + req.params.phase,
        pipeline: req.params.pipeline,
        phase: req.params.phase,
        plural: req.body.plural,
        id: req.params.addonID
    } as IAddonMinimal;
    await req.app.locals.addons.deleteAddon(addon);
    res.send('ok');
});