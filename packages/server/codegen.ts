import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: './graphql/schema/',
  generates: {
    'generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        scalars: {
          DateTime: 'Date',
        },
      },
    },
    '../webapp/src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        scalars: {
          DateTime: 'Date',
        },
      },
    },
    '../projector/src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        scalars: {
          DateTime: 'Date',
        },
      },
    },
    '../www/src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        scalars: {
          DateTime: 'Date',
        },
      },
    },
  },
};

export default config;
