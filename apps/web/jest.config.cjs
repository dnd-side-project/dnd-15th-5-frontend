/** @type {import('jest').Config} */
module.exports = {
  watchman: false,
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  moduleNameMapper: {
    '\\.svg\\?react$': '<rootDir>/test/svgMock.tsx',
    '\\.png$': '<rootDir>/test/imageMock.ts',
    '^@/shared/lib/env$': '<rootDir>/src/shared/lib/env.mock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/(?:.*/)?\\.expo/',
    '<rootDir>/(?:.*/)?ios/(?:.*/)?\\.build/',
    '<rootDir>/(?:.*/)?android/\\.gradle/',
    '<rootDir>/(?:.*/)?android/(?:.*/)?build/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          isolatedModules: true,
        },
      },
    ],
  },
};
