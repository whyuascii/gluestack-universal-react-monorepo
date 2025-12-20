/**
 * Example Tailwind configuration using the Sample App theme
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
const sampleappTheme = require("tailwind-config/themes/sampleapp");

module.exports = createTailwindConfig({
  // App-specific content paths
  content: ["./src/**/*.{html,js,jsx,ts,tsx,mdx}", "./app/**/*.{html,js,jsx,ts,tsx,mdx}"],

  // Web-specific setting (use for Next.js apps)
  important: "html",

  // Import the Sample App theme
  theme: sampleappTheme,

  // Add Tailwind plugins for better form styling
  plugins: [require("@tailwindcss/forms")],

  // Optional: Add custom safelist patterns for Sample App colors
  safelist: [
    {
      pattern: /(bg|text|border)-(sa-green|sa-yellow|sa-blue|sa-beige|sa-bark|sa-coral|sa-teal)/,
    },
  ],
});

/**
 * After setting up this config, you can use Sample App classes:
 *
 * Colors:
 * - bg-sa-green, text-sa-green, border-sa-green
 * - bg-sa-yellow, text-sa-yellow, border-sa-yellow
 * - bg-sa-blue, text-sa-blue, border-sa-blue
 * - bg-sa-beige (primary background)
 * - text-sa-bark (primary text)
 * - bg-sa-coral (errors/alerts)
 * - bg-sa-teal (contrast/highlights)
 *
 * Typography:
 * - font-sans (Quicksand/Nunito)
 *
 * Rounded corners:
 * - rounded-xl (16px)
 * - rounded-2xl (24px)
 * - rounded-3xl (32px)
 *
 * Shadows:
 * - shadow-sa-sm, shadow-sa-md, shadow-sa-lg, shadow-sa-xl
 *
 * PLUS all the default gluestack colors:
 * - bg-primary-500, text-error-600, etc.
 */
