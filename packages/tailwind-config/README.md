# @app/tailwind-config

Shared Tailwind CSS configuration with a semantic design system for cross-platform React apps.

## Design Philosophy

We use a **hierarchy-driven** approach to color and styling—**purpose over percentages**.

| Old Thinking          | Our Approach                                      |
| --------------------- | ------------------------------------------------- |
| "60% must be neutral" | Use surfaces based on content hierarchy           |
| "30% secondary color" | Use brand colors where they serve purpose         |
| "10% accent only"     | Accents can be bold or subtle based on context    |
| Fixed percentages     | Flexible based on user needs and brand expression |

## Color System

### Surfaces (Where Content Lives)

Use surface tokens for layout hierarchy, not color percentages.

```tsx
<View className="bg-surface-canvas" />     // App background
<View className="bg-surface" />            // Cards and panels
<View className="bg-surface-elevated" />   // Modals and popovers
<View className="bg-surface-sunken" />     // Inset/recessed areas
<View className="bg-surface-inverse" />    // Dark sections
<View className="bg-surface-overlay" />    // Modal backdrop
```

### Content (What Users Read)

Use content tokens for text hierarchy through contrast.

```tsx
<Text className="text-content-muted" />     // Placeholders, captions
<Text className="text-content" />           // Body text (default)
<Text className="text-content-emphasis" />  // Headings, key info
<Text className="text-content-inverse" />   // On dark backgrounds
<Text className="text-content-link" />      // Links
```

### Brand Colors

Brand colors are tools, not constraints. Use based on context.

```tsx
// Primary - Key actions, brand moments
<Button className="bg-primary-500 hover:bg-primary-600" />

// Secondary - Supporting actions
<Button className="bg-secondary-400" />

// Accent - Highlights, badges, special moments
<Badge className="bg-accent-500" />
```

### Functional States

States communicate meaning with semantic shortcuts.

```tsx
// Success
<View className="bg-success-bg border border-success-border">
  <Text className="text-success-text">Saved successfully</Text>
</View>

// Error
<View className="bg-error-bg border border-error-border">
  <Text className="text-error-text">Something went wrong</Text>
</View>

// Warning
<View className="bg-warning-bg border border-warning-border">
  <Text className="text-warning-text">Please review</Text>
</View>

// Info
<View className="bg-info-bg border border-info-border">
  <Text className="text-info-text">Did you know?</Text>
</View>
```

## Available Themes

### `themes/starter.js` (Default)

The starter theme with semantic color tokens. Customize this for your app.

- Semantic colors: `primary`, `secondary`, `tertiary`, `error`, `success`, `warning`, `info`
- Surface system: `surface-canvas`, `surface`, `surface-elevated`, `surface-sunken`
- Content hierarchy: `content-muted`, `content`, `content-emphasis`

### `themes/sample.js` (Example)

A sample theme demonstrating custom branding:

- Brand colors: `app-green`, `app-yellow`, `app-blue`, `app-beige`, `app-bark`, `app-coral`, `app-teal`
- Custom shadows: `shadow-app-md`, `shadow-hard-2`
- Softer border radius (up to 32px)

### `themes/default.js`

The original gluestack-ui theme with CSS variables. Use for dynamic theming or to revert to the original system.

## Usage

### Basic Setup (Recommended)

```javascript
// apps/web/tailwind.config.js
const createTailwindConfig = require("@app/tailwind-config");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: "html",
});
```

### Override Theme Colors

```javascript
const createTailwindConfig = require("@app/tailwind-config");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      primary: {
        500: "#FF0000", // Override primary-500
      },
    },
  },
});
```

### Use Original Gluestack Theme

```javascript
const createTailwindConfig = require("@app/tailwind-config");
const originalTheme = require("@app/tailwind-config/themes/default");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: originalTheme,
});
```

## Building Hierarchy

Hierarchy comes from **multiple signals**, not just color:

### 1. Surface Elevation

```tsx
// Low emphasis
<View className="bg-surface-sunken rounded-lg p-4">
  <Text className="text-content-muted">Secondary info</Text>
</View>

// Standard
<View className="bg-surface rounded-lg p-4 shadow-sm">
  <Text className="text-content">Main content</Text>
</View>

// High emphasis
<View className="bg-surface-elevated rounded-lg p-6 shadow-lg">
  <Text className="text-content-emphasis">Important action</Text>
</View>
```

### 2. Typography Weight + Size

```tsx
<Text className="text-2xs text-content-muted">Caption</Text>
<Text className="text-sm text-content">Body</Text>
<Text className="text-lg font-semibold text-content-emphasis">Heading</Text>
```

### 3. Color + Context

```tsx
// Primary as background
<View className="bg-primary-500 p-8">
  <Text className="text-content-inverse">Hero section</Text>
</View>

// Primary as accent
<View className="bg-surface p-4 border-l-4 border-primary-500">
  <Text className="text-content">Highlighted content</Text>
</View>
```

## Component Patterns

### Cards

```tsx
<View className="bg-surface rounded-2xl shadow-md p-6">
  <Text className="text-content-emphasis text-lg font-semibold">Title</Text>
  <Text className="text-content-muted text-sm">Subtitle</Text>
  <Text className="text-content mt-4">Body content...</Text>
</View>
```

### Buttons

```tsx
// Primary
<Button className="bg-primary-500 hover:bg-primary-600 text-white">Save</Button>

// Secondary
<Button className="bg-surface border border-outline-300 text-content">Cancel</Button>

// Destructive
<Button className="bg-error-500 hover:bg-error-600 text-white">Delete</Button>

// Ghost
<Button className="bg-transparent text-content-muted hover:text-content">More</Button>
```

### Form Fields

```tsx
// Default
<Input className="bg-surface border border-outline-300 text-content" />

// Error
<Input className="bg-error-bg border border-error-border" />
<Text className="text-error-text text-sm">Error message</Text>

// Focused
<Input className="focus:border-primary-500 focus:shadow-focus" />
```

### Alerts

```tsx
<View className="bg-error-bg border border-error-border rounded-xl p-4 flex-row">
  <AlertCircle className="text-error-icon mr-3" />
  <View>
    <Text className="text-error-text font-semibold">Error</Text>
    <Text className="text-error-text opacity-80">Description</Text>
  </View>
</View>
```

## Creating a Custom Theme

1. Create a new file in `themes/` (e.g., `themes/myapp.js`)

2. Define your brand colors:

```javascript
const brand = {
  primary: {
    base: "#YOUR_PRIMARY",
    light: "#LIGHTER_VARIANT",
    dark: "#DARKER_VARIANT",
  },
  secondary: {
    /* ... */
  },
  accent: {
    /* ... */
  },
  neutral: {
    /* ... */
  },
};

module.exports = {
  colors: {
    primary: {
      50: brand.primary.light,
      500: brand.primary.base,
      600: brand.primary.dark,
      // ... full scale
    },
    // ... other semantic colors
  },
  fontFamily: {
    sans: ["YourFont", "sans-serif"],
  },
};
```

3. Use it in your app:

```javascript
const myappTheme = require("@app/tailwind-config/themes/myapp");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: myappTheme,
});
```

## Quick Reference

| Token                   | Use For                |
| ----------------------- | ---------------------- |
| `bg-surface-canvas`     | App background         |
| `bg-surface`            | Cards, panels          |
| `bg-surface-elevated`   | Modals, dropdowns      |
| `text-content-muted`    | Captions, placeholders |
| `text-content`          | Body text              |
| `text-content-emphasis` | Headings, important    |
| `bg-primary-500`        | Primary buttons, brand |
| `bg-secondary-400`      | Secondary actions      |
| `bg-accent-500`         | Highlights, badges     |
| `bg-error-bg`           | Error containers       |
| `text-error-text`       | Error messages         |
| `border-outline-200`    | Subtle borders         |

## Theme Merging

The factory function **deep merges** your custom theme with base themes:

- Colors from multiple themes are available simultaneously
- Custom values override base values for the same key
- Fonts, spacing, and other values follow the same merge behavior
