const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    ignores: [
      "node_modules/",
      ".expo/",
      "dist/",
      "web-build/",
      "coverage/",
      "assets/",
    ],
  },
  {
    files: ["**/__tests__/**/*.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
    },
  },
];
