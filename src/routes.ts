import express, { Express, Request, Response } from 'express';
import { Keroku } from './keroku';
export const keroku = new Keroku();
export const Router = express.Router();

Router.get('/config', async function (req: Request, res: Response) {
    res.send("config");
});

Router.post('/apps/new', async function (req: Request, res: Response) {
    keroku.newApp(req.body.appname, req.body.gitrepo, req.body.reviewapps);
    res.send("new");
});
