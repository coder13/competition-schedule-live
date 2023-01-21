import {
  DateTimeResolver,
  DateTimeTypeDefinition,
  VoidResolver,
  VoidTypeDefinition,
} from 'graphql-scalars';
import resolvers from './resolvers';
import typeDefs, { joinTypeDefs } from './schema';

export default {
  typeDefs: joinTypeDefs([
    DateTimeTypeDefinition,
    VoidTypeDefinition,
    ...typeDefs,
  ]),
  resolvers: {
    DateTime: DateTimeResolver,
    Void: VoidResolver,
    ...resolvers,
  },
};
