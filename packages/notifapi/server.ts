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
import session, { SessionOptions } from 'express-session';
import cookieParser from 'cookie-parser';
import prisma from './db';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

import { internal, external } from './routes/v0';

const SECRET = process.env.SESSION_SECRET ?? 'compnotifySecret';

const sessionOptions: SessionOptions & {
  cookie: { secure: boolean | 'auto' };
} = {
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
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

export async function init() {
  const app = express();

  app.use(json());
  app.use(morgan('tiny'));

  app.get('/', (_, res) => {
    res.end('Hello World!');
  });

  app.get(
    '/ping',
    cors<cors.CorsRequest>({
      origin: '*',
    }),
    (_, res) => {
      res.end('pong');
    }
  );

  app.use('/v0/external', external);

  console.log(
    `Allowing the following origins: ${
      process.env.CORS_ORIGINS?.split(',')?.join(', ') ?? 'none'
    }`
  );
  app.use(
    cors<cors.CorsRequest>({
      allowedHeaders: 'Content-Type',
      origin: process.env.CORS_ORIGINS?.split(','),
      preflightContinue: true,
      credentials: true,
    })
  );

  app.set('trust proxy', 1); // trust first proxy

  app.use(cookieParser(SECRET));
  app.use(session(sessionOptions));

  app.use('/v0/internal', internal);

  return app;
}
