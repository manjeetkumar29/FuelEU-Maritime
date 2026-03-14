/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleNameMapper: {
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@adapters/(.*)$": "<rootDir>/src/adapters/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  testMatch: ["**/tests/**/*.test.ts"],
  globalSetup: "<rootDir>/tests/setup.ts",
  globalTeardown: "<rootDir>/tests/teardown.ts",
};
