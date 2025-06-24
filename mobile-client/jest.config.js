// jest.config.js
module.exports = {
  preset: 'react-native',
  verbose: true,
  testEnvironment: 'jsdom', // or 'node', depending on your needs
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|react-clone-referenced-element|@nozbe|watermelondb))',
  ],
  setupFiles: [
    './jest-setup.js', // if you have any global mocks or setup
  ],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^react-native-config$': '<rootDir>/__mocks__/react-native-config.js',
  },
};

