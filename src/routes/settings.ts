import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';

export const Router = express.Router();
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();
export const bearerMiddleware = auth.getBearerMiddleware();



// get a list of addons
Router.get('/cli/settings', bearerMiddleware, async function (req: Request, res: Response) {
    let addonslist = await req.app.locals.settings.getSettings();
    res.send(addonslist)
});

// get a list of addons
Router.get('/settings', authMiddleware, async function (req: Request, res: Response) {
    let addonslist = await req.app.locals.settings.getSettings();
    res.send(addonslist)
});
