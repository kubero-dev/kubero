import express, { Express, Request, Response } from 'express';
import path, { resolve } from 'path'
import history from 'connect-history-api-fallback';
import dotenv from 'dotenv';
import debug from 'debug';
import http from 'http';
dotenv.config();
import {configure} from './configure';

debug('app:server')


const app: Express = express();
const server = http.createServer(app)
const port: String = process.env.PORT || "2000";

// API
configure(app, server);

const maxAge = process.env.NODE_ENV === 'development' ? '1s' : '1h';

const publicDir = path.join(__dirname, 'public');
const publicPath = resolve(__dirname, publicDir); // TODO change to client-new an fix path for docker image
const staticConf = { maxAge: maxAge, etag: true };

app.use(history());
app.use(express.static(publicPath, staticConf));

server.listen(port, () => debug.log(`⚡️[server]: Server is running at http://127.0.0.1:${port}`));
