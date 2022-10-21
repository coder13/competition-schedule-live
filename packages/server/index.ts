import http from 'http';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import { json } from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import graphqlServerConfig from './graphql';
import { ApolloServer, BaseContext } from '@apollo/server';

dotenv.config({
  debug: true,
});

const port = process.env.PORT ?? '8080';
const WCA_ORIGIN = 'https://staging.worldcubeassociation.org';
const CLIENT_ID = 'example-application-id';
const CLIENT_SECRET = 'example-secret';
const REDIRECT_URI = 'http://localhost:8080/auth/wca/callback';

async function init() {
  const app = express();

  app.use(cors<cors.CorsRequest>());
  app.use(json());

  app.use(morgan('tiny'));

  app.get('/auth/wca/', (req, res) => {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: 'public email manage_competitions',
    });

    res.redirect(`${WCA_ORIGIN}/oauth/authorize?${params.toString()}`);
  });

  app.get('/auth/wca/callback', async (req, res) => {
    const { code } = req.query;

    if (typeof code !== 'string') {
      res.status(400).send('Missing code');
      return;
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    });

    try {
      const response = await fetch(`${WCA_ORIGIN}/oauth/token`, {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw await response.json();
      }

      const token = await response.json();

      const profileRes = await fetch(`${WCA_ORIGIN}/api/v0/me`, {
        headers: {
          Authorization: `Bearer ${token.access_token as string}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileRes.ok) {
        throw await profileRes.json();
      }

      res.json(await profileRes.json());
    } catch (e) {
      console.error(e);
      res.status(500).send(e);
    }
  });

  const httpServer = http.createServer(app);

  // Same ApolloServer initialization as before, plus the drain plugin
  // for our httpServer.
  const server = new ApolloServer<BaseContext>({
    ...graphqlServerConfig,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Ensure we wait for our server to start
  await server.start();

  app.use(
    '/graphql',
    (req, res, next) => {
      console.log('graphql', req.body.query);
      return next();
    },
    expressMiddleware(server)
  );

  return app;
}

init()
  .then((app) =>
    app.listen(port, () => {
      console.log('Server is running on port', port);
    })
  )
  .catch((e) => console.error(e));
