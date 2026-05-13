/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['<rootDir>/**/*.test.ts', '<rootDir>/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/prisma/generated/', '/generated/'],
  collectCoverageFrom: [
    '<rootDir>/auth/**/*.ts',
    '<rootDir>/controllers/**/*.ts',
    '<rootDir>/graphql/resolvers/**/*.ts',
    '<rootDir>/lib/**/*.ts',
    '<rootDir>/middlewares/**/*.ts',
    '<rootDir>/scheduler/**/*.ts',
    '<rootDir>/services/**/*.ts',
    '!<rootDir>/**/*.spec.ts',
    '!<rootDir>/**/*.test.ts',
    '!<rootDir>/**/index.ts',
    '!<rootDir>/generated/**',
    '!<rootDir>/prisma/generated/**',
    '!<rootDir>/mocks/**',
    '!<rootDir>/**/*.d.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/generated/',
    '/prisma/generated/',
    '/mocks/',
  ],
  coverageThreshold: {
    global: {
      branches: 25,
      functions: 25,
      lines: 25,
      statements: 25,
    },
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
  clearMocks: true,
  restoreMocks: true,
};
