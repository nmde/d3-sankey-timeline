/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testEnvironment: 'node',
  transform: {
    '.+\\.jsx?$': 'babel-jest',
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
  transformIgnorePatterns: [],
};
