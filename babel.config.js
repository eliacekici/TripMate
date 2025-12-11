// babel.config.js

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  //presets: ['babel-preset-expo'],

  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env', 
        safe: false, 
        allowUndefined: true,
      },
    ],
  ],
};