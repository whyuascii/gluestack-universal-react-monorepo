# Tailwind Themes

This directory contains theme presets that can be used with the shared Tailwind configuration.

## Available Themes

### `nestquest.js` (Default)

The NestQuest theme - a warm, cozy design for couples and families. This is the **base theme** used across all apps.

**Features:**

- Brand colors: `nq-green`, `nq-yellow`, `nq-blue`, `nq-beige`, `nq-bark`, `nq-coral`, `nq-teal`
- Semantic color system: `primary`, `secondary`, `tertiary`, `error`, `success`, `warning`, `info`
- Friendly typography (Quicksand/Nunito)
- Softer border radius (up to 32px)
- Custom shadows for card hierarchy

**Color Mapping:**

- Primary: Soft Leaf Green (`#A8CBB7`)
- Secondary: Warm Sun Yellow (`#FAD97A`)
- Tertiary: Calm Sky Blue (`#8EB8E5`)
- Error: Coral Blush (`#F4AFA6`)
- Success: Forest Teal (`#427D74`)
- Background: Clay Beige (`#F6F1EB`)
- Typography: Cozy Bark Brown (`#4E3F30`)

### `default.js`

The original gluestack-ui theme with semantic color tokens using CSS variables. Use this if you want to revert to the original theme or build a custom theme from scratch.

## Usage

### Option 1: Use Combined Themes (Default - No Changes Needed)

```javascript
// apps/web/tailwind.config.js
const createTailwindConfig = require("@app/tailwind-config");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: "html",
});
```

This gives you access to **both** NestQuest and Gluestack colors:

**NestQuest Colors (Primary):**

- **Semantic colors**: `bg-primary-500`, `text-error-600`, `bg-success-100` (uses NestQuest palette)
- **Brand colors**: `bg-nq-green`, `text-nq-bark`, `border-nq-coral`
- **Custom shadows**: `shadow-nq-md`, `shadow-hard-2`

**Gluestack Colors (Available with `gs-` prefix):**

- **CSS Variable colors**: `bg-gs-primary-500`, `text-gs-error-600`, `bg-gs-secondary-100`
- Use these when you need the original gluestack-ui CSS variable-based colors
- Useful for dynamic theming or if you prefer the original color system

### Option 2: Revert to Original Gluestack Theme

```javascript
// apps/web/tailwind.config.js
const createTailwindConfig = require("@app/tailwind-config");
const originalTheme = require("tailwind-config/themes/default");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: originalTheme,
  plugins: [require("@tailwindcss/forms")],
});
```

This replaces NestQuest colors with the original gluestack-ui theme using CSS variables.

### Option 3: Add Custom Colors Inline

```javascript
// apps/web/tailwind.config.js
const createTailwindConfig = require("@app/tailwind-config");

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
const createTailwindConfig = require("@app/tailwind-config");

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

## Color System Examples

### Using NestQuest Colors (Recommended)

```jsx
// Semantic colors (NestQuest palette)
<button className="bg-primary-500 hover:bg-primary-600 text-white">
  Primary Button
</button>

<div className="bg-error-50 border border-error-500 text-error-900">
  Error message
</div>

// Brand colors (direct access)
<div className="bg-nq-beige text-nq-bark border-nq-green">
  Cozy NestQuest card
</div>

// Custom shadows
<div className="shadow-nq-md rounded-2xl">
  Card with soft shadow
</div>
```

### Using Gluestack Colors (CSS Variables)

```jsx
// When you need CSS variable-based colors
<button className="bg-gs-primary-500 hover:bg-gs-primary-600 text-white">
  Gluestack Button
</button>

<div className="bg-gs-background-50 text-gs-typography-900">
  Using original gluestack theme
</div>
```

### Mixing Both

```jsx
// You can use both in the same component!
<div className="bg-nq-beige border-gs-outline-200">
  <h1 className="text-nq-bark font-heading">NestQuest Title</h1>
  <p className="text-gs-typography-700 font-body">Using gluestack typography color</p>
</div>
```

## Theme Merging Behavior

The factory function **deep merges** your custom theme with the base themes:

- **Colors**: Both NestQuest and Gluestack colors are available simultaneously
- **Fonts**: Custom fonts are added alongside default fonts
- **Other values**: Same deep merge behavior

If you specify the same key, your value **overrides** the base themes.
