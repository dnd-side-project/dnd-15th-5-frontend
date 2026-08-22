/** @type {import('jest').Config} */
module.exports = {
  watchman: false,
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  moduleNameMapper: {
    '\\.css$': '<rootDir>/test/fileMock.ts',
    '\\.(gif|jpe?g|png|webp)$': '<rootDir>/test/fileMock.ts',
    '\\.svg\\?react$': '<rootDir>/test/svgMock.tsx',
    '\\.svg$': '<rootDir>/test/fileMock.ts',
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
