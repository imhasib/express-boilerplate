module.exports = {
  testEnvironment: 'node',
  restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.js', 'tests'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@faker-js/faker)/)',
  ],
  setupFiles: ['<rootDir>/tests/utils/setEnvVars.js'],
};
