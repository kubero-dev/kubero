import { Express } from 'express';
import cors from 'cors';
import { Server } from 'http';
import bodyParser from 'body-parser';
import { Router } from "./routes";
import { init } from './socket'
import { Kubero } from './kubero';
import { Addons } from './modules/addons';

export const before = (app: Express) => {
    app.use(cors())
    app.use(bodyParser.json());
}

export const after = (app: Express, server: Server) => {
    // Attache socket.io to server
    let sockets = init(server);
    const kubero = new Kubero(sockets);
    kubero.updateState();
    app.locals.kubero = kubero;
    const addons = new Addons({
        kubectl: kubero.kubectl
    });
    app.locals.addons = addons;
    app.use('/api', Router);
}
