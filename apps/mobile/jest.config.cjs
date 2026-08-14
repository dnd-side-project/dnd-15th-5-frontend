module.exports = {
  preset: 'jest-expo',
  watchman: false,
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/test/svgMock.cjs',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    // NOTE: standard-navigation은 expo-router가 내부적으로 쓰는 ESM 전용 패키지라 CJS로 변환해야 한다.
    'node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|standard-navigation))',
  ],
};
