/* eslint-disable import/first */
import path from 'path';
import dotenv from 'dotenv';

const CONFIG_PATH = path.join(
  __dirname,
  `.env.${process.env.NODE_ENV ?? 'development'}`
);

dotenv.config({
  debug: process.env.NODE_ENV !== 'production',
  path: CONFIG_PATH,
});
dotenv.config({
  debug: process.env.NODE_ENV !== 'production',
  path: `${CONFIG_PATH}.local`,
});

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { json } from 'body-parser';

import api from './routes';

const port = process.env.PORT ?? '8090';

async function init() {
  const app = express();

  app.use(cors<cors.CorsRequest>());
  app.use(json());

  app.use(morgan('tiny'));

  app.use(api);

  return app;
}

init()
  .then((app) =>
    app.listen(port, () => {
      console.log('Server is running on port', port);
    })
  )
  .catch((e) => console.error(e));
