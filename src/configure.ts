import { Express } from 'express';
import cors from 'cors';
import { Server } from 'http';
import session from 'express-session';
import bodyParser from 'body-parser';
import { Router } from "./routes";
import { auth } from "./routes";
//import { passport } from './modules/auth';
import { init } from './socket'
import { Kubero } from './kubero';
import { Addons } from './modules/addons';

const { KUBER_SESSION_KEY = "3KYu07W85yDjIhUtBVHa61gmF" } = process.env;

export const before = (app: Express) => {
    app.use(cors())
    app.use(session({
        name: 'KuberoSessioneee',
        secret: KUBER_SESSION_KEY,
        resave: false,
        saveUninitialized: true,
    }));
    app.use(bodyParser.json());
    if (process.env.KUBERO_USERS) {
        console.log("initialize Passport");
        /*
        app.use(auth.passport.initialize());
        app.use(auth.passport.session());
        */
    
        app.use(auth.passport.initialize());
        app.use(auth.passport.session());
    }
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
