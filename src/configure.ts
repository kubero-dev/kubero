import { Express } from 'express';
import cors from 'cors';
import { Server } from 'http';
import bodyParser from 'body-parser';
import { Router } from "./routes";
import { init } from './socket'
import { Keroku } from './keroku';

//const watcher = require('./watcher');

if (process.env.DOCKER_BUILD != 'true') {
    //setInterval(watcher, 3000, locust.locust);
}

export const before = (app: Express) => {
    app.use(cors())
    app.use(bodyParser.json());
}

export const after = (app: Express, server: Server) => {
    // Attach socket.io to server
    let sockets = init(server);
    const keroku = new Keroku(sockets);
    app.locals.keroku = keroku;
    app.use('/api', Router);
}
