import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';

export const Router = express.Router();
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.authMiddleware; // requires allways a authentification
export const bearerMiddleware = auth.getBearerMiddleware();

Router.get('/cli/settings', bearerMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['Settings']
    // #swagger.summary = 'Get the Kubero settings'
    /* #swagger.security = [{
            "bearerAuth": {
                "type": 'http',
                "scheme": 'bearer',
                "bearerFormat": 'JWT',
            }
    }] */
    const settings = await req.app.locals.settings.getSettings();
    res.send(settings)
});

// get the settings
Router.get('/settings', authMiddleware, async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the Kubero settings'
    const settings = await req.app.locals.settings.getSettings();
    res.send(settings)
});


// get the dashboard banner
Router.get('/banner', async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the Kubero Dashboad banner'

    const defaultbanner = {
        show: false,
        text: "",
        bgcolor: "white",
        fontcolor: "white"
    }

    let banner = await req.app.locals.kubero.config.kubero?.banner || defaultbanner;
    res.send(banner)
});
