import type { CodegenConfig } from '@graphql-codegen/cli';

const backendConf = {
  plugins: ['typescript', 'typescript-resolvers'],
  config: {
    scalars: {
      DateTime: 'Date',
    },
  },
};

const frontendConf = {
  plugins: ['typescript', 'typescript-resolvers'],
  config: {
    scalars: {
      DateTime: 'string',
    },
  },
};

const config: CodegenConfig = {
  overwrite: true,
  schema: './graphql/schema/',
  generates: {
    'generated/graphql.ts': backendConf,
    '../webapp/src/generated/graphql.ts': frontendConf,
    '../projector/src/generated/graphql.ts': frontendConf,
    '../www/src/generated/graphql.ts': frontendConf,
    '../admin/src/generated/graphql.ts': frontendConf,
  },
};

export default config;
