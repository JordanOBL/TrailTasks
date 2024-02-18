// jest.config.js
module.exports = {
  // Other Jest configuration options...
  transform: {},
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
  preset: 'react-native',
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules'],
  testPathIgnorePatterns: [
    '/node_modules/', // Ignore files in node_modules
    '/__tests__/mockTestUsers.js',
  ],
};
