import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: './graphql/schema/',
  generates: {
    'generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
};

export default config;
