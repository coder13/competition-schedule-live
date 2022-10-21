import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';

const gqlFiles = readdirSync(join(__dirname, './schema'));

const typeDefs = gqlFiles
  .map((file) =>
    readFileSync(join(__dirname, './schema', file), {
      encoding: 'utf8',
    })
  )
  .join('\n');

const schema = makeExecutableSchema({
  typeDefs,
  // resolvers pending...
});

export default schema;
