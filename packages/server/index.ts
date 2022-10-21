import express from 'express';
import dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import { schema } from './graphql';

dotenv.config({
  debug: true,
});

const port = process.env.PORT;

const app = express();

app.use('/graphql', () => {
  graphqlHTTP(() => ({
    schema,
    graphiql: true,
  }));
});

app.listen(port, () => {
  console.log('Server is running on port', port);
});
