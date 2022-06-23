import { Express } from 'express';
import cors from 'cors';
import { Server } from 'http';
import bodyParser from 'body-parser';
import { Router } from "./routes";
import { init } from './socket'
import { Keroku } from './keroku';

export const before = (app: Express) => {
    app.use(cors())
    app.use(bodyParser.json());
}

export const after = (app: Express, server: Server) => {
    // Attache socket.io to server
    let sockets = init(server);
    const keroku = new Keroku(sockets);
    keroku.init();
    app.locals.keroku = keroku;
    app.use('/api', Router);
}
