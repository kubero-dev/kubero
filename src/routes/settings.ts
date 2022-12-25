import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';

export const Router = express.Router();
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.authMiddleware; // requires allways a authentification
export const bearerMiddleware = auth.getBearerMiddleware();



// get the settings
Router.get('/cli/settings', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['CLI']
    let addonslist = await req.app.locals.settings.getSettings();
    res.send(addonslist)
});

// get the settings
Router.get('/settings', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Settings']
    let addonslist = await req.app.locals.settings.getSettings();
    res.send(addonslist)
});
