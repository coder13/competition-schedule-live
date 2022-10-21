import http from 'http';
import express from 'express';
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

const port = process.env.PORT;

async function init() {
  const app = express();

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
    cors<cors.CorsRequest>(),
    json(),
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
