import nodeConfig from "@app/eslint-config/node.js";

/**
 * ESLint configuration for the core-contract package
 * Uses shared Node.js config from packages/eslint-config
 */
export default [
  ...nodeConfig,
  {
    ignores: ["dist/**"],
  },
];
