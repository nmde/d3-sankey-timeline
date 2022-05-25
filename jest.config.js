/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  moduleNameMapper: {
    d3: '<rootDir>/node_modules/d3/dist/d3.min.js',
  },
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testEnvironment: 'node',
};
