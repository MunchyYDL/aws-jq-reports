import type { Config } from "jest";

/**
 * Gets the default jest configuration for DevHouse Node backend projects
 *
 * @param {Options} [options] Jest config object. If you want to extend a default value, you can modify the returned object.
 * @returns A jest config object
 */
export const getDefaultJestConfig = (options: Config) => ({
  collectCoverage: true,
  coverageDirectory: "<rootDir>/test-reports/coverage",
  coverageReporters: ["lcov", "text-summary", "json-summary"],
  moduleFileExtensions: ["ts", "js", "json", "node", "mjs"],
  preset: "ts-jest",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        suiteName: "Unit tests",
        outputDirectory: "./test-reports",
        outputName: "unit-tests.xml",
      },
    ],
  ],
  rootDir: "./",
  transform: {
    "^.+\\.m?(ts|js)$": "ts-jest",
  },
  ...options,
});

export default getDefaultJestConfig({
  collectCoverageFrom: ["<rootDir>/src/**/*.(ts|js)"],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testMatch: ["<rootDir>/tests/**/*.test.+(ts|js)"],
});
