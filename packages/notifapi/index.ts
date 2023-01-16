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

declare module 'express-session' {
  interface SessionData {
    auth: {
      number?: {
        number: string;
        code: string;
        expires: number; // Unix timestamp
        verified?: boolean;
      };
    };
    userId?: number;
  }
}

declare module 'express' {
  interface Request {
    user?: User;
  }
}

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { json } from 'body-parser';
import session, { SessionOptions } from 'express-session';
import cookieParser from 'cookie-parser';
import prisma from './db';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

import api from './routes';
import { User } from './prisma/generated/client';

const port = process.env.PORT ? +process.env.PORT : 8090;

const SECRET = process.env.SESSION_SECRET ?? 'compnotifySecret';

const sessionOptions: SessionOptions & {
  cookie: { secure: boolean | 'auto' };
} = {
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // 2 weeks
  },
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 14 * 24 * 60 * 60 * 1000, // 2 weeks
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
};
async function init() {
  const app = express();

  app.use(
    cors<cors.CorsRequest>({
      origin: ['http://localhost:5173'],
      preflightContinue: true,
      credentials: true,
    })
  );
  app.use(json());

  app.use(morgan('tiny'));

  app.set('trust proxy', 1); // trust first proxy
  if (app.get('env') === 'production') {
    sessionOptions.cookie.secure = true; // serve secure cookies
  }

  app.use(cookieParser(SECRET));
  app.use(session(sessionOptions));

  app.use(api);

  return app;
}

init()
  .then((app) =>
    app.listen(port, 'localhost', () => {
      console.log('Server is running on port', port);
    })
  )
  .catch((e) => console.error(e));
