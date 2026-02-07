/**
 * Sample Theme Configuration
 *
 * A warm, cozy theme example. Use this as a starting point
 * and customize for your app's brand.
 *
 * CUSTOMIZATION: Copy this file, rename it, and adjust the colors
 * to match your brand identity.
 */

// Brand Colors (customize these)
const brandColors = {
  green: "#A8D5BA", // Soft Leaf Green (updated)
  yellow: "#F4D35E", // Warm Sun Yellow (updated)
  beige: "#F6F1EB", // Clay Beige
  bark: "#4E3F30", // Cozy Bark Brown
  blue: "#8EB8E5", // Calm Sky Blue
  cream: "#FFF9F0", // Cozy Cream (updated from beige)
  brown: "#8B7355", // Natural Brown (new)
  dark: "#5D4D3B", // Deep Bark Brown (new)
  light: "#FFFDF9", // Light Cream (new)
  coral: "#F4AFA6", // Coral Blush
  teal: "#427D74", // Forest Teal
};

// Helper function to generate color scale from a base color
const generateColorScale = (baseColor, isDark = false) => {
  // For simplicity, we'll use the base color and lighter/darker variations
  // In a real implementation, you'd use a color manipulation library
  return {
    0: "#FFFFFF",
    50: isDark ? `${baseColor}15` : `${baseColor}10`,
    100: isDark ? `${baseColor}25` : `${baseColor}20`,
    200: isDark ? `${baseColor}35` : `${baseColor}30`,
    300: isDark ? `${baseColor}45` : `${baseColor}40`,
    400: isDark ? `${baseColor}65` : `${baseColor}60`,
    500: baseColor,
    600: baseColor,
    700: baseColor,
    800: isDark ? baseColor : `${baseColor}`,
    900: isDark ? baseColor : `${baseColor}`,
    950: isDark ? baseColor : "#000000",
  };
};

module.exports = {
  colors: {
    // Brand colors (direct access with app- prefix)
    "app-bark": brandColors.bark,
    "app-beige": brandColors.beige,
    "app-blue": brandColors.blue,
    "app-brown": brandColors.brown,
    "app-coral": brandColors.coral,
    "app-cream": brandColors.cream,
    "app-dark": brandColors.dark,
    "app-green": brandColors.green,
    "app-light": brandColors.light,
    "app-teal": brandColors.teal,
    "app-yellow": brandColors.yellow,

    // Grouped brand colors
    brand: {
      green: brandColors.green,
      yellow: brandColors.yellow,
      cream: brandColors.cream,
      brown: brandColors.brown,
      dark: brandColors.dark,
      light: brandColors.light,
    },

    // Semantic color system (for gluestack-ui components)
    primary: {
      0: "#FFFFFF",
      50: "#F3F8F5",
      100: "#E7F1EB",
      200: "#D0E3D7",
      300: "#B8D5C3",
      400: "#A8D5BA", // Base green (updated)
      500: "#8BB79F",
      600: "#6EA387",
      700: "#588270",
      800: "#426259",
      900: "#2C4141",
      950: "#1A2828",
    },
    secondary: {
      0: "#FFFFFF",
      50: "#FFFDF5",
      100: "#FEF9E7",
      200: "#FDF3CF",
      300: "#FCEDB7",
      400: "#F4D35E", // Base yellow (updated)
      500: "#F2C63C",
      600: "#E5B524",
      700: "#C79A1D",
      800: "#9A7816",
      900: "#6D550F",
      950: "#403208",
    },
    tertiary: {
      50: "#F5F9FD",
      100: "#EBF3FA",
      200: "#D7E7F5",
      300: "#C3DBF0",
      400: "#8EB8E5", // Base blue
      500: "#6AA3D9",
      600: "#4B8ECD",
      700: "#3A70A3",
      800: "#2D5679",
      900: "#203C4F",
      950: "#132225",
    },
    error: {
      0: "#FFFFFF",
      50: "#FEF7F6",
      100: "#FDEFED",
      200: "#FBDFDB",
      300: "#F9CFC9",
      400: "#F4AFA6", // Base coral
      500: "#F08F84",
      600: "#EC6F62",
      700: "#E84F40",
      800: "#C63B2D",
      900: "#9A2E23",
      950: "#6E211A",
    },
    success: {
      0: "#FFFFFF",
      50: "#F0F6F5",
      100: "#E1EDEB",
      200: "#C3DBD7",
      300: "#A5C9C3",
      400: "#87B7AF",
      500: "#69A59B",
      600: "#427D74", // Base teal
      700: "#356459",
      800: "#284B43",
      900: "#1B322D",
      950: "#0E1917",
    },
    warning: {
      0: "#FFFFFF",
      50: "#FFFDF5",
      100: "#FEF9E7",
      200: "#FDF3CF",
      300: "#FCEDB7",
      400: "#FAD97A", // Using yellow as warning
      500: "#F8C94D",
      600: "#E5B334",
      700: "#C7981D",
      800: "#9A7616",
      900: "#6D540F",
      950: "#403208",
    },
    info: {
      0: "#FFFFFF",
      50: "#F5F9FD",
      100: "#EBF3FA",
      200: "#D7E7F5",
      300: "#C3DBF0",
      400: "#8EB8E5", // Using blue as info
      500: "#6AA3D9",
      600: "#4B8ECD",
      700: "#3A70A3",
      800: "#2D5679",
      900: "#203C4F",
      950: "#132225",
    },
    typography: {
      0: "#FFFFFF",
      50: "#FAFAF9",
      100: "#F5F4F3",
      200: "#EBE9E7",
      300: "#E1DEDB",
      400: "#D7D3CF",
      500: "#CDC8C3",
      600: "#A89E97",
      700: "#83746B",
      800: "#4E3F30", // Base bark
      900: "#3A2F24",
      950: "#261F18",
      white: "#FFFFFF",
      gray: "#CDC8C3",
      black: "#261F18",
    },
    outline: {
      0: "#FFFFFF",
      50: "#FAFAF9",
      100: "#F5F4F3",
      200: "#EBE9E7",
      300: "#E1DEDB",
      400: "#D7D3CF",
      500: "#CDC8C3",
      600: "#A89E97",
      700: "#83746B",
      800: "#5E4F46",
      900: "#3A2F24",
      950: "#261F18",
    },
    background: {
      0: "#FFFFFF",
      50: "#FFFEFE",
      100: "#FFFCFA",
      200: "#FFFAF7",
      300: "#FFF9F4",
      400: "#FFF9F0", // Base cream (updated)
      500: "#FFF5E8",
      600: "#FFEFD9",
      700: "#FFE9CA",
      800: "#FFE3BB",
      900: "#FFDDAC",
      950: "#FFD79D",
      error: "#FEF7F6",
      warning: "#FFFDF5",
      muted: "#FFF9F0",
      success: "#F0F6F5",
      info: "#F5F9FD",
      light: "#FFFDF9",
      dark: "#5D4D3B",
    },
    indicator: {
      primary: brandColors.green,
      info: brandColors.blue,
      error: brandColors.coral,
    },
  },
  fontFamily: {
    heading: ["Quicksand", "Nunito", "ui-sans-serif", "system-ui"],
    body: ["Nunito", "Quicksand", "ui-sans-serif", "system-ui"],
    mono: ["ui-monospace", "monospace"],
    sans: ["Nunito", "Quicksand", "ui-sans-serif", "system-ui"],
    display: ["Quicksand", "ui-sans-serif", "system-ui"],
    jakarta: ["var(--font-plus-jakarta-sans)"],
    roboto: ["var(--font-roboto)"],
    code: ["var(--font-source-code-pro)"],
    inter: ["var(--font-inter)"],
    "space-mono": ["var(--font-space-mono)"],
  },
  fontWeight: {
    extrablack: "950",
  },
  fontSize: {
    "2xs": "10px",
  },
  borderRadius: {
    xl: "16px",
    "2xl": "24px",
    "3xl": "32px",
    "4xl": "2rem",
    "5xl": "3rem",
    "app-rounded": "2.5rem", // Custom rounded corners
  },
  spacing: {
    // Add custom spacing if needed
  },
  keyframes: {
    float: {
      "0%": { transform: "translateY(0px) rotate(0deg)" },
      "50%": { transform: "translateY(-10px) rotate(5deg)" },
      "100%": { transform: "translateY(0px) rotate(0deg)" },
    },
  },
  animation: {
    float: "float 6s ease-in-out infinite",
    "float-slow": "float 8s ease-in-out infinite",
    "float-delayed": "float 7s ease-in-out infinite 1s",
  },
  boxShadow: {
    // Custom brand shadows
    "app-sm": "0 1px 2px 0 rgba(78, 63, 48, 0.05)",
    "app-md": "0 4px 6px -1px rgba(78, 63, 48, 0.1)",
    "app-lg": "0 10px 15px -3px rgba(78, 63, 48, 0.1)",
    "app-xl": "0 20px 25px -5px rgba(78, 63, 48, 0.1)",
    // Card shadows
    card: "0 10px 30px -5px rgba(139, 115, 85, 0.1)",
    "card-hover": "0 20px 40px -5px rgba(139, 115, 85, 0.15)",
    // Gluestack-ui shadows
    "hard-1": "-2px 2px 8px 0px rgba(78, 63, 48, 0.20)",
    "hard-2": "0px 3px 10px 0px rgba(78, 63, 48, 0.20)",
    "hard-3": "2px 2px 8px 0px rgba(78, 63, 48, 0.20)",
    "hard-4": "0px -3px 10px 0px rgba(78, 63, 48, 0.20)",
    "hard-5": "0px 2px 10px 0px rgba(78, 63, 48, 0.10)",
    "soft-1": "0px 0px 10px rgba(78, 63, 48, 0.1)",
    "soft-2": "0px 0px 20px rgba(78, 63, 48, 0.2)",
    "soft-3": "0px 0px 30px rgba(78, 63, 48, 0.1)",
    "soft-4": "0px 0px 40px rgba(78, 63, 48, 0.1)",
  },
};
