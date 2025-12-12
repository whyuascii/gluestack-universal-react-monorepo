/**
 * Sample App custom theme configuration
 *
 * Example theme demonstrating how to extend the default theme
 * with custom brand colors and styling
 */
module.exports = {
  colors: {
    // Sample App brand colors
    "sa-green": "#A8CBB7", // Soft Leaf Green - Primary Accent
    "sa-yellow": "#FAD97A", // Warm Sun Yellow - Secondary Accent
    "sa-blue": "#8EB8E5", // Calm Sky Blue - Tertiary Accent
    "sa-beige": "#F6F1EB", // Clay Beige - Primary Background
    "sa-bark": "#4E3F30", // Cozy Bark Brown - Primary Text
    "sa-coral": "#F4AFA6", // Coral Blush - Error/Alert
    "sa-teal": "#427D74", // Forest Teal - Contrast/Deep Accent
  },
  fontFamily: {
    sans: ["Quicksand", "Nunito", "ui-sans-serif", "system-ui"],
  },
  borderRadius: {
    xl: "16px",
    "2xl": "24px",
    "3xl": "32px", // Softer, more friendly curves
  },
  // Extend with additional spacing if needed for component layouts
  spacing: {
    // Add custom spacing values here if needed
  },
  // Custom box shadows for card hierarchy
  boxShadow: {
    "sa-sm": "0 1px 2px 0 rgba(78, 63, 48, 0.05)",
    "sa-md": "0 4px 6px -1px rgba(78, 63, 48, 0.1)",
    "sa-lg": "0 10px 15px -3px rgba(78, 63, 48, 0.1)",
    "sa-xl": "0 20px 25px -5px rgba(78, 63, 48, 0.1)",
  },
};
