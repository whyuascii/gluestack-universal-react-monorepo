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
 * // Basic usage (uses starter theme + gluestack colors with 'gs-' prefix)
 * const createTailwindConfig = require("@app/tailwind-config");
 * module.exports = createTailwindConfig({
 *   content: ["./src/**\/*.{js,jsx,ts,tsx}"],
 *   important: "html"
 * });
 * // Available colors:
 * // - Semantic: bg-primary-500, text-error-600, bg-secondary-300
 * // - Accent: bg-accent-500, text-accent-700
 * // - Gluestack (CSS vars): bg-gs-primary-500, text-gs-error-600
 *
 * @example
 * // With custom theme preset
 * const createTailwindConfig = require("@app/tailwind-config");
 * const customTheme = require("@app/tailwind-config/themes/starter");
 * module.exports = createTailwindConfig({
 *   content: ["./src/**\/*.{js,jsx,ts,tsx}"],
 *   theme: customTheme,
 *   plugins: [require('@tailwindcss/forms')]
 * });
 *
 * @example
 * // With inline custom colors (merges with default)
 * const createTailwindConfig = require("@app/tailwind-config");
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

  // Import themes
  const starterTheme = require("./themes/starter");
  const gluestackTheme = require("./themes/default");

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

  // Helper to prefix color keys
  const prefixColors = (colors, prefix) => {
    const prefixed = {};
    for (const [key, value] of Object.entries(colors)) {
      if (typeof value === "object" && !Array.isArray(value)) {
        // Don't prefix nested objects, keep structure
        prefixed[`${prefix}-${key}`] = value;
      } else {
        prefixed[`${prefix}-${key}`] = value;
      }
    }
    return prefixed;
  };

  // Add gluestack colors with 'gs-' prefix to make them available alongside starter theme
  const gluestackPrefixedColors = prefixColors(gluestackTheme.colors, "gs");

  // Merge gluestack colors into starter theme
  const baseTheme = {
    ...starterTheme,
    colors: {
      ...starterTheme.colors,
      ...gluestackPrefixedColors,
    },
  };

  // Merge custom theme with combined base theme
  const mergedTheme = mergeTheme(baseTheme, theme);

  // Base safelist patterns for starter theme
  const baseSafelist = [
    // Semantic surface tokens (hierarchy-driven)
    {
      pattern: /(bg|border)-(surface)-(canvas|elevated|sunken|overlay|inverse)/,
    },
    // Semantic content tokens (text hierarchy)
    {
      pattern: /(text)-(content)-(muted|emphasis|inverse|link|link-hover)/,
    },
    {
      pattern: /(text)-(content)/,
    },
    // State semantic shortcuts (bg, border, text, icon)
    {
      pattern: /(bg|border|text)-(success|warning|error|info)-(bg|border|text|icon)/,
    },
    // Brand and standard color scales
    {
      pattern:
        /(bg|border|text|stroke|fill)-(primary|secondary|tertiary|error|success|warning|info|typography|outline|background|indicator|accent)-(0|50|100|200|300|400|500|600|700|800|900|950|white|gray|black|error|warning|muted|success|info|light|dark|primary)/,
    },
    // Gluestack prefixed colors
    {
      pattern:
        /(bg|border|text|stroke|fill)-(gs)-(primary|secondary|tertiary|error|success|warning|info|typography|outline|background|indicator)-(0|50|100|200|300|400|500|600|700|800|900|950|white|gray|black|error|warning|muted|success|info|light|dark|primary)/,
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
