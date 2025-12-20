import { FlatCompat } from "@eslint/eslintrc";
import prettierConfig from "eslint-config-prettier";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import baseConfig from "./base.js";

const compat = new FlatCompat();

/**
 * ESLint configuration for Next.js applications
 * Extends base config with Next.js, React, and accessibility rules
 */
export default [
  ...baseConfig,

  // Next.js recommended configs (using FlatCompat for legacy configs)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // React and accessibility configuration
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React rules
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Next.js doesn't require React import
      "react/prop-types": "off", // Using TypeScript for prop validation

      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,

      // Accessibility rules (recommended subset)
      ...jsxA11yPlugin.configs.recommended.rules,
    },
  },

  // Prettier config (must be last to override formatting rules)
  prettierConfig,
];
