import { Express } from 'express';
import cors from 'cors';
import { Server } from 'http';
import bodyParser from 'body-parser';
import { Router } from "./routes";
import {init} from './socket'

//const socket = require('./socket');
//let locust = require('./locust');

//const watcher = require('./watcher');

if (process.env.DOCKER_BUILD != 'true') {
    //setInterval(watcher, 3000, locust.locust);
}

export const before = (app: Express) => {
    app.use(cors())
    app.use(bodyParser.json());
    app.use('/api', Router);
}

export const after = (app: Express, server: Server) => {
    // Attach socket.io to server
    //socket.init(server);
    init(server);
    console.log("after");
}
