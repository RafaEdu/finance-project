module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["utils/**/*.js", "constants/**/*.js", "!utils/uuid.js"],
};
