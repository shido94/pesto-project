module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules', 'src/api/config', 'src/api/server/index.js', 'src/tests'],
  testTimeout: 20000,
};
