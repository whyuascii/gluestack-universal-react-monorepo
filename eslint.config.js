import baseConfig from "./packages/eslint-config/base.js";

/**
 * Root ESLint configuration for the monorepo
 * Uses shared base config from packages/eslint-config
 */
export default [
  ...baseConfig,
  // Additional root-level ignores for the root directory
  // Each package/app has its own eslint config
  {
    ignores: ["apps/**", "packages/**", "deployment/**", "scripts/**", "docs/**"],
  },
];
