// babel.config.js

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env', // Check that this path is correct relative to the root
        safe: false, 
        allowUndefined: true,
      },
    ],
  ],
};