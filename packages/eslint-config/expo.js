import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import baseConfig from "./base.js";

/**
 * ESLint configuration for Expo/React Native applications and packages
 * Extends base config with React and React Native specific rules
 */
export default [
  ...baseConfig,

  // React and React Native configuration
  {
    files: ["**/*.tsx", "**/*.jsx"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
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
      "react/jsx-filename-extension": [
        "warn",
        { extensions: [".jsx", ".tsx"] },
      ],
    },
  },
];
