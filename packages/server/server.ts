/* eslint-disable import/first */
import path from 'path';
import dotenv from 'dotenv';

const CONFIG_PATH = path.join(
  __dirname,
  `.env.${process.env.NODE_ENV ?? 'development'}`
);

console.log('Loading env files from', CONFIG_PATH);

dotenv.config({
  debug: process.env.NODE_ENV !== 'production',
  path: CONFIG_PATH,
});

import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { json } from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServer } from '@apollo/server';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import graphqlServerConfig from './graphql';
import AuthRouter from './auth';
import db from './db';
import { makeExecutableSchema } from '@graphql-tools/schema';
import WcaApi from './graphql/datasources/WcaApi';
import { authMiddlewareVerify } from './auth/AuthMiddleware';
import { WCA_ORIGIN } from './env';
import { initScheduler } from './scheduler';
import { pubsub } from './graphql/pubsub';

export interface AppContext {
  user?: User;
  db: typeof db;
  pubsub: PubSub;
  wcaApi: WcaApi;
}

export async function init() {
  await initScheduler();

  const app = express();

  app.use(cors<cors.CorsRequest>());
  app.use(json());

  app.use(morgan('tiny'));

  app.get('/', (_, res) => {
    res.end('Hello World!');
  });

  app.get('/ping', (_, res) => {
    res.end('pong');
  });

  app.use('/auth', AuthRouter);

  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const getDynamicContext = () => ({
    pubsub,
  });

  const serverCleanup = useServer(
    {
      schema: makeExecutableSchema(graphqlServerConfig),
      context: () => {
        return getDynamicContext();
      },
    },
    wsServer
  );

  const shutdownWSPlugin = {
    async serverWillStart() {
      return {
        async drainServer() {
          await serverCleanup.dispose();
        },
      };
    },
  };

  // Same ApolloServer initialization as before, plus the drain plugin
  // for our httpServer.
  const server = new ApolloServer<AppContext>({
    ...graphqlServerConfig,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
      shutdownWSPlugin,
    ],
  });

  app.set('WCA_ORIGIN', WCA_ORIGIN);

  // Ensure we wait for our server to start
  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: ['*', 'https://studio.apollographql.com'],
    }),
    authMiddlewareVerify,
    (req, _, next) => {
      if (req?.body?.query?.includes?.('IntrospectionQuery')) {
        return next();
      }

      console.log('graphql', req.body.query);
      return next();
    },
    expressMiddleware(server, {
      context: async ({ req }) => ({
        user: req.user,
        db,
        pubsub,
        wcaApi: new WcaApi(app.get('WCA_ORIGIN'), req.user?.wca.accessToken),
      }),
    })
  );

  return httpServer;
}
