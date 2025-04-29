module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
};