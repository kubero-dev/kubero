import express, { Express, Request, Response } from 'express';
export const Router = express.Router();

// the namespace where the locust instance should be deployed
Router.get('/config', async function (req: Request, res: Response) {
    res.send("config");
});
