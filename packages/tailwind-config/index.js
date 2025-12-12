/**
 * Shared Tailwind CSS configuration factory
 * Creates a consistent theme across web and mobile apps
 *
 * @param {Object} options - Configuration options
 * @param {string[]} options.content - App-specific content paths
 * @param {string} [options.important] - CSS importance selector (e.g., "html")
 * @param {Object} [options.theme] - Custom theme to merge with base theme
 * @param {Array} [options.plugins] - Additional Tailwind plugins
 * @param {Array} [options.safelist] - Additional safelist patterns
 * @returns {import('tailwindcss').Config}
 *
 * @example
 * // Basic usage (uses default gluestack theme)
 * const createTailwindConfig = require("tailwind-config");
 * module.exports = createTailwindConfig({
 *   content: ["./src/**\/*.{js,jsx,ts,tsx}"],
 *   important: "html"
 * });
 *
 * @example
 * // With custom theme preset
 * const createTailwindConfig = require("tailwind-config");
 * const nestquestTheme = require("tailwind-config/themes/nestquest");
 * module.exports = createTailwindConfig({
 *   content: ["./src/**\/*.{js,jsx,ts,tsx}"],
 *   theme: nestquestTheme,
 *   plugins: [require('@tailwindcss/forms')]
 * });
 *
 * @example
 * // With inline custom colors (merges with default)
 * const createTailwindConfig = require("tailwind-config");
 * module.exports = createTailwindConfig({
 *   content: ["./src/**\/*.{js,jsx,ts,tsx}"],
 *   theme: {
 *     colors: {
 *       'brand-primary': '#FF0000',
 *     }
 *   }
 * });
 */
module.exports = function createTailwindConfig(options = {}) {
  const {
    content = [],
    important,
    theme = {},
    plugins = [],
    safelist = [],
    ...restConfig
  } = options;

  // Import default theme
  const defaultTheme = require("./themes/default");

  // Deep merge function for theme objects
  const mergeTheme = (base, custom) => {
    const merged = { ...base };

    for (const key in custom) {
      if (custom[key] && typeof custom[key] === "object" && !Array.isArray(custom[key])) {
        merged[key] = mergeTheme(base[key] || {}, custom[key]);
      } else {
        merged[key] = custom[key];
      }
    }

    return merged;
  };

  // Merge custom theme with default theme
  const mergedTheme = mergeTheme(defaultTheme, theme);

  // Base safelist patterns for default theme
  const baseSafelist = [
    {
      pattern:
        /(bg|border|text|stroke|fill)-(primary|secondary|tertiary|error|success|warning|info|typography|outline|background|indicator)-(0|50|100|200|300|400|500|600|700|800|900|950|white|gray|black|error|warning|muted|success|info|light|dark|primary)/,
    },
  ];

  return {
    darkMode: process.env.DARK_MODE ? process.env.DARK_MODE : "class",
    content: [
      // Shared package paths (always included)
      "../../packages/components/src/**/*.{js,jsx,ts,tsx}",
      "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
      // App-specific content paths
      ...content,
    ],
    presets: [require("nativewind/preset")],
    ...(important && { important }),
    safelist: [...baseSafelist, ...safelist],
    theme: {
      extend: mergedTheme,
    },
    plugins: [...plugins],
    ...restConfig,
  };
};
