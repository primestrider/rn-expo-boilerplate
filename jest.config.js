/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",

  // Tests live in a single tree that mirrors `src/`.
  roots: ["<rootDir>/tests"],

  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  // Mirrors the `paths` entries in tsconfig.json — Jest does not read them.
  moduleNameMapper: {
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "configs/**/*.ts",
    "!src/app/**",
    "!src/example/**",
    "!**/index.ts",
  ],
};
