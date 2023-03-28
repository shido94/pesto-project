module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: [
    'node_modules',
    'src/api/config',
    'src/api/utils',
    'src/api/server/index.js',
    'src/tests',
  ],
  testTimeout: 2000000,
};
