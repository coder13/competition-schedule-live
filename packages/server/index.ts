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

import fs from 'fs';
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { json } from 'body-parser';
import jwt from 'jsonwebtoken';
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

const port = process.env.PORT ?? '8080';
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? fs.readFileSync('public.key');

export interface AppContext {
  user?: User;
  db: typeof db;
  pubsub: PubSub;
  wcaApi: WcaApi;
}

async function init() {
  const app = express();

  app.use(cors<cors.CorsRequest>());
  app.use(json());

  app.use(morgan('tiny'));

  app.use('/auth', AuthRouter);

  // TODO: This should be moved to a separate file
  // Authenticates user by verifying JWT token
  app.use((req, _, next) => {
    const { headers } = req;

    const split = headers?.authorization?.split(/\s/);

    if (!split || split.length < 2) {
      next();
      return;
    }

    if (split[0] !== 'Bearer') {
      next(null);
    }

    const token = split[1];

    jwt.verify(token, PUBLIC_KEY, (err, decoded) => {
      if (err) {
        return next(err);
      }

      req.user = decoded as User | undefined;
      next(null);
    });
  });

  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const pubsub = new PubSub();

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

  // Ensure we wait for our server to start
  await server.start();

  app.use(
    '/graphql',
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
        wcaApi: new WcaApi(
          process.env.WCA_ORIGIN ?? 'https://staging.worldcubeassociation.org',
          req.user?.wca.accessToken
        ),
      }),
    })
  );

  return httpServer;
}

init()
  .then((app) =>
    app.listen(port, () => {
      console.log('Server is running on port', port);
    })
  )
  .catch((e) => console.error(e));
