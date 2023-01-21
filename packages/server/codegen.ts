import type { CodegenConfig } from '@graphql-codegen/cli';

const conf = {
  plugins: ['typescript', 'typescript-resolvers'],
  config: {
    scalars: {
      DateTime: 'Date',
    },
  },
};

const config: CodegenConfig = {
  overwrite: true,
  schema: './graphql/schema/',
  generates: {
    'generated/graphql.ts': conf,
    '../webapp/src/generated/graphql.ts': conf,
    '../projector/src/generated/graphql.ts': conf,
    '../www/src/generated/graphql.ts': conf,
    '../admin/src/generated/graphql.ts': conf,
  },
};

export default config;
