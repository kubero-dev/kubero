import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import debug from 'debug';
debug('app:server')

dotenv.config();

const app: Express = express();
const port: String = process.env.PORT || "3000";

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  //console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  debug.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});