module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }], // Add support for legacy decorators
    ['@babel/plugin-proposal-class-properties', { loose: true }], // Support for class properties
    ['module:react-native-dotenv',{
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env.test',
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
        verbose: false,
      },],
    'react-native-reanimated/plugin',
  ],
};

