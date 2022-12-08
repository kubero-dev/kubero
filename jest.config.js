/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {

  //verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ["<rootDir>/jest.setup.js"],

  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};