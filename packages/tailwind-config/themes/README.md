# Tailwind Themes

This directory contains theme presets that can be used with the shared Tailwind configuration.

## Available Themes

### `default.js`

The base gluestack-ui theme with semantic color tokens (primary, secondary, error, success, etc.)

### `sampleapp.js`

Example theme demonstrating custom brand colors and styling with:

- Brand colors: `sa-green`, `sa-yellow`, `sa-blue`, `sa-beige`, `sa-bark`, `sa-coral`, `sa-teal`
- Rounded, friendly typography (Quicksand/Nunito)
- Softer border radius (up to 32px)
- Custom shadows for card hierarchy

## Usage

### Option 1: Use Default Theme (No Changes Needed)

```javascript
// apps/web/tailwind.config.js
const createTailwindConfig = require("tailwind-config");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: "html",
});
```

### Option 2: Use a Theme Preset

```javascript
// apps/web/tailwind.config.js
const createTailwindConfig = require("tailwind-config");
const sampleappTheme = require("tailwind-config/themes/sampleapp");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: sampleappTheme,
  plugins: [require("@tailwindcss/forms")],
});
```

This adds Sample App colors **on top of** the default theme, so you get both:

- Default colors: `bg-primary-500`, `text-error-600`, etc.
- Sample App colors: `bg-sa-green`, `text-sa-bark`, etc.

### Option 3: Add Custom Colors Inline

```javascript
// apps/web/tailwind.config.js
const createTailwindConfig = require("tailwind-config");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      "brand-blue": "#0066CC",
      "brand-red": "#FF0000",
    },
    borderRadius: {
      huge: "48px",
    },
  },
});
```

### Option 4: Override Default Colors

If you want to **replace** the primary color instead of adding to it:

```javascript
const createTailwindConfig = require("tailwind-config");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      primary: {
        500: "#FF0000", // Override default primary-500
      },
    },
  },
});
```

## Creating Your Own Theme

1. Create a new file in this directory (e.g., `myapp.js`)
2. Export a theme object:

```javascript
module.exports = {
  colors: {
    "myapp-primary": "#123456",
    "myapp-secondary": "#654321",
  },
  fontFamily: {
    sans: ["MyCustomFont", "sans-serif"],
  },
  // ... other Tailwind theme values
};
```

3. Import and use it in your app:

```javascript
const myappTheme = require("tailwind-config/themes/myapp");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: myappTheme,
});
```

## Theme Merging Behavior

The factory function **deep merges** your custom theme with the default theme:

- **Colors**: Custom colors are added alongside default colors
- **Fonts**: Custom fonts are added alongside default fonts
- **Other values**: Same deep merge behavior

If you specify the same key, your value **overrides** the default.
