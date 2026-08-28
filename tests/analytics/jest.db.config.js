import base from "../../jest.config.js";
export default {
  ...base,
  rootDir: "../..",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/analytics/*.db.test.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  testTimeout: 60000,
};
