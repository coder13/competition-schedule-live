import { DateTimeResolver, DateTimeTypeDefinition } from 'graphql-scalars';
import resolvers from './resolvers';
import typeDefs, { joinTypeDefs } from './schema';

export default {
  typeDefs: joinTypeDefs([DateTimeTypeDefinition, ...typeDefs]),
  resolvers: {
    DateTime: DateTimeResolver,
    ...resolvers,
  },
};
