import prettierConfig from "eslint-config-prettier";
import baseConfig from "./base.js";

/**
 * ESLint configuration for Node.js backend packages
 * Extends base config with Node.js specific environment and rules
 */
export default [
  ...baseConfig,

  // Node.js specific configuration
  {
    files: ["**/*.ts", "**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      globals: {
        // Node.js globals
        global: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "writable",
      },
    },
    rules: {
      // Node.js specific rules
      "no-console": "off", // Console is fine in backend code
      "prefer-const": "warn",

      // Async/await best practices
      "no-async-promise-executor": "error",
      "require-await": "warn",

      // Error handling
      "no-throw-literal": "error",
    },
  },

  // Prettier config (must be last to override formatting rules)
  prettierConfig,
];
