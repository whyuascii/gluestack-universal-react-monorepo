/**
 * Example Tailwind configuration using a custom theme
 *
 * This file demonstrates how to use a custom theme preset
 * in your app's tailwind.config.js
 *
 * To use this in your app:
 * 1. Copy the content of this file to your app's tailwind.config.js
 * 2. Adjust the content paths to match your app structure
 * 3. Add any app-specific customizations
 */

const createTailwindConfig = require("@app/tailwind-config");
const sampleTheme = require("tailwind-config/themes/sample");

module.exports = createTailwindConfig({
  // App-specific content paths
  content: ["./src/**/*.{html,js,jsx,ts,tsx,mdx}", "./app/**/*.{html,js,jsx,ts,tsx,mdx}"],

  // Web-specific setting (use for Next.js apps)
  important: "html",

  // Import the sample theme
  theme: sampleTheme,

  // Add Tailwind plugins for better form styling
  plugins: [require("@tailwindcss/forms")],

  // Optional: Add custom safelist patterns for your brand colors
  safelist: [
    {
      pattern: /(bg|text|border)-(brand-primary|brand-secondary)/,
    },
  ],
});

/**
 * After setting up this config, you can use your custom theme classes.
 *
 * See packages/tailwind-config/DESIGN-SYSTEM.md for theme customization.
 * See packages/tailwind-config/themes/sample.js for an example theme.
 *
 * PLUS all the default gluestack colors:
 * - bg-primary-500, text-error-600, etc.
 */
