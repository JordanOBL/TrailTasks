module.exports = function (api) {
  api.cache(true);

  const nodeEnv = process.env.NODE_ENV || 'development'; // 'development' is the fallback
  const appEnv = process.env.APP_ENV || nodeEnv; // Use NODE_ENV if APP_ENV is not set

  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      ['@babel/plugin-proposal-decorators', {legacy: true}],
      [
        'module:react-native-dotenv', {
        moduleName: '@env',
        path: `.env.${appEnv}`, // Uses APP_ENV or NODE_ENV if APP_ENV is not set
      },
      ],
      'react-native-reanimated/plugin'
    ],
  };
};
