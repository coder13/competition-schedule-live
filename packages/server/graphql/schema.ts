import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';

const gqlFiles = readdirSync(join(__dirname, './schema'));

const typeDefs = gqlFiles
  .map((file) =>
    readFileSync(join(__dirname, './schema', file), {
      encoding: 'utf8',
    })
  )
  .join('\n');

export default typeDefs;
