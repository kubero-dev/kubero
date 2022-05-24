import express, { Express, Request, Response } from 'express';
import { Keroku } from './keroku';
export const keroku = new Keroku();
export const Router = express.Router();

// the namespace where the locust instance should be deployed
Router.get('/config', async function (req: Request, res: Response) {
    res.send("config");
});

Router.post('/apps/new', async function (req: Request, res: Response) {
    keroku.newApp('test');
    res.send("new");
});
