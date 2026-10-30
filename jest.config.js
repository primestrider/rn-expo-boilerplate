const { transformIgnorePatterns } = require("jest-expo/jest-preset");

/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",

  // Tests live in a single tree that mirrors `src/`.
  roots: ["<rootDir>/tests"],

  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  // The preset's allowlist, plus packages that publish untranspiled ESM.
  transformIgnorePatterns: [
    transformIgnorePatterns[0].replace("(?!(", "(?!(@shopify/flash-list|"),
    ...transformIgnorePatterns.slice(1),
  ],

  moduleNameMapper: {
    // Mirrors the `paths` entries in tsconfig.json — Jest does not read them.
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
