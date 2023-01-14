import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_API_ORIGIN}/graphql`,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${import.meta.env.VITE_WS_ORIGIN}/graphql`,
  })
);

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('jwt');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
});

export default client;
