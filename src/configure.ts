import { Express } from 'express';
import cors from 'cors';
import { Server } from 'http';
import session from 'express-session';
import bodyParser from 'body-parser';
import { RouterAddons } from "./routes/addons";
import { auth, RouterAuth } from "./routes/auth";
import { RouterConfig } from "./routes/config";
import { RouterApps} from "./routes/apps";
import { RouterLogs } from "./routes/logs";
import { RouterPipelines } from "./routes/pipelines";
import { RouterRepo } from "./routes/repo";
import { init } from './socket'
import { Kubero } from './kubero';
import { Addons } from './modules/addons';
import * as crypto from "crypto"
import SwaggerUi from 'swagger-ui-express';

const { KUBERO_SESSION_KEY = crypto.randomBytes(20).toString('hex') } = process.env;

export const before = (app: Express) => {
    app.use(cors())
    app.use(session({
        name: 'KuberoSession',
        secret: KUBERO_SESSION_KEY,
        resave: false,
        saveUninitialized: true,
    }));
    app.use(bodyParser.json());
    if (auth.authentication === true) {
        console.log("initialize Passport");

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
    addons.loadOperators();
    app.locals.addons = addons;
    app.use('/api', RouterAddons);
    app.use('/api', RouterAuth);
    app.use('/api', RouterConfig);
    app.use('/api', RouterApps);
    app.use('/api', RouterLogs);
    app.use('/api', RouterPipelines);
    app.use('/api', RouterRepo);
    const swagger = SwaggerUi.setup(require('../swagger.json'));
    app.use('/api/docs', SwaggerUi.serve, swagger);
}
