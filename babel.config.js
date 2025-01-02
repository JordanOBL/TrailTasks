module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }], // Add support for legacy decorators
    ['@babel/plugin-proposal-class-properties', { loose: true }], // Support for class properties
    ['module:react-native-dotenv'],
    'react-native-reanimated/plugin',
  ],
};

