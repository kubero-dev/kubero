import { Express } from 'express';
import cors from 'cors';
import { Server } from 'http';
import bodyParser from 'body-parser';
import { Router } from "./routes";
import { init } from './socket'
import { Keroku } from './keroku';
import { GithubWebhooksMiddleware } from './github/webhooks';

export const before = (app: Express) => {
    app.use(cors())
    app.use(bodyParser.json());
    app.use(GithubWebhooksMiddleware);
}

export const after = (app: Express, server: Server) => {
    // Attache socket.io to server
    let sockets = init(server);
    const keroku = new Keroku(sockets);
    keroku.init();
    app.locals.keroku = keroku;
    app.use('/api', Router);
}
