import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";
import baseConfig from "./base.js";

/**
 * ESLint configuration for Expo/React Native applications and packages
 * Extends base config with React and React Native specific rules
 */
export default [
  ...baseConfig,

  // React and React Native configuration
  {
    files: ["**/*.tsx", "**/*.jsx", "**/*.ts", "**/*.js"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Cross-platform globals (available in both React Native and web)
        process: "readonly",
        fetch: "readonly",
        console: "readonly",

        // Browser globals (available when running on web platform)
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        alert: "readonly",

        // React Native globals
        __DEV__: "readonly",
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React rules
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not required in React Native
      "react/prop-types": "off", // Using TypeScript for prop validation

      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,

      // React Native specific
      "react/jsx-filename-extension": ["warn", { extensions: [".jsx", ".tsx"] }],
    },
  },

  // Prettier config (must be last to override formatting rules)
  prettierConfig,
];
