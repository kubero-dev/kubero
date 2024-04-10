import { Express } from 'express';
import cookieParser from 'cookie-parser';
import helmet from "helmet";
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
import { Router as RouterSettings } from "./routes/settings";
import { Router as RouterTemplates } from "./routes/templates";
import { Router as RouterSecurity } from "./routes/security";
import { init } from './socket'
import { Kubero } from './kubero';
import { Addons } from './modules/addons';
import { Kubectl } from './modules/kubectl';
import { Notifications } from './modules/notifications';
import { Settings } from './modules/settings';
import { Audit, AuditEntry } from './modules/audit';
import * as crypto from "crypto"
import SwaggerUi from 'swagger-ui-express';
import * as fs from 'fs';

const { KUBERO_SESSION_KEY = crypto.randomBytes(20).toString('hex') } = process.env;

export const configure = async (app: Express, server: Server) => {
    // Load Version from File
    process.env.npm_package_version = fs.readFileSync('./VERSION','utf8');;

    app.use(cors())
    app.use(cookieParser())
    app.use(session({
        name: 'KuberoSession',
        secret: KUBERO_SESSION_KEY,
        resave: false,
        saveUninitialized: true,
    }));
    app.use(bodyParser.json());
    if (auth.authentication === true) {
        console.log("Enable Authentication");

        app.use(auth.passport.initialize());
        app.use(auth.passport.session());
    }

    app.use(helmet({
            contentSecurityPolicy: false,
            strictTransportSecurity: false,
            crossOriginOpenerPolicy: false,
            crossOriginEmbedderPolicy: false,
         }));

    app.use('/api', RouterAddons);
    app.use('/api', RouterAuth);
    app.use('/api', RouterConfig);
    app.use('/api', RouterApps);
    app.use('/api', RouterLogs);
    app.use('/api', RouterPipelines);
    app.use('/api', RouterRepo);
    app.use('/api', RouterSettings);
    app.use('/api', RouterTemplates);
    app.use('/api', RouterSecurity);
    const swagger = SwaggerUi.setup(require('../swagger.json'));
    app.use('/api/docs', SwaggerUi.serve, swagger);

    // Attache socket.io to server
    let sockets = init(server, auth.authentication);

    // create websocket and set it as en variable
    process.env.KUBERO_WS_TOKEN = crypto.randomBytes(20).toString('hex');

    const kubectl = new Kubectl();

    const audit = new Audit(
        process.env.KUBERO_AUDIT_DB_PATH || './db', 
        parseInt(process.env.KUBERO_AUDIT_LIMIT || '1000') 
    );
    await audit.init();
    app.locals.audit = audit;

    const auditEntry: AuditEntry = {
        user: 'kubero',
        severity: 'normal',
        action: 'start',
        namespace: '',
        phase: '',
        app: '',
        pipeline: '',
        resource: 'system',
        message: 'server started',
    }
    audit.logDelayed(auditEntry); // wait till db is created

    const notifications = new Notifications(sockets, audit, kubectl);

    const kubero = new Kubero(sockets, audit, kubectl, notifications);

    // sleep 1 seconds to wait for kubernetes availability test
    await new Promise(resolve => setTimeout(resolve, 1000));

    kubero.updateState();
    app.locals.kubero = kubero;

    const addons = new Addons({
        kubectl: kubero.kubectl
    });
    addons.loadOperators();
    app.locals.addons = addons;

    const settings = new Settings({
        kubectl: kubero.kubectl,
        config: kubero.config,
        notifications: notifications,
        audit: audit,
        io: sockets,
    });
    app.locals.settings = settings;
}
