# Customizing Your Brand

This guide covers how to make the boilerplate your own: colors, fonts, logos, and copy.

## Quick Brand Checklist

- [ ] Update app name in `package.json`
- [ ] Set colors in `packages/tailwind-config/themes/starter.js`
- [ ] Add logo files to `apps/web/public/` and `apps/mobile/assets/`
- [ ] Update `apps/mobile/app.json` with your app details
- [ ] Customize translations in `packages/i18n/src/locales/`
- [ ] Update email templates in `packages/mailer/src/templates/`

## Theme Configuration

The design system is powered by Tailwind CSS with NativeWind for React Native. All theming is centralized in one file.

### Color Palette

**File:** `packages/tailwind-config/themes/starter.js`

```javascript
module.exports = {
  // Primary brand color (buttons, links, accents)
  primary: {
    0: "#E8F5E9", // Lightest - backgrounds
    50: "#C8E6C9",
    100: "#A5D6A7",
    200: "#81C784",
    300: "#66BB6A",
    400: "#4CAF50", // Main - buttons, links
    500: "#43A047",
    600: "#388E3C",
    700: "#2E7D32",
    800: "#1B5E20",
    900: "#0D3F14", // Darkest - pressed states
  },

  // Background colors
  background: {
    0: "#FFFFFF", // Main background
    50: "#F9FAFB", // Subtle background
    100: "#F3F4F6", // Cards, inputs
    200: "#E5E7EB", // Borders
    // ...
  },

  // Typography colors
  typography: {
    0: "#FFFFFF", // On dark backgrounds
    500: "#6B7280", // Secondary text
    700: "#374151", // Primary text
    900: "#111827", // Headings
  },

  // Semantic colors
  error: {
    /* red shades */
  },
  warning: {
    /* yellow shades */
  },
  success: {
    /* green shades */
  },
  info: {
    /* blue shades */
  },
};
```

### Using Theme Colors

```tsx
// In your components
<View className="bg-background-0">
  <Text className="text-typography-900">Heading</Text>
  <Text className="text-typography-500">Secondary text</Text>
  <Button className="bg-primary-400">Click me</Button>
</View>
```

### Dark Mode

The theme includes comprehensive dark mode support with semantic color tokens:

```javascript
// In packages/tailwind-config/themes/starter.js
module.exports = {
  primary: {
    /* ... */
  },

  // Dark mode surface colors
  darkSurfaces: {
    canvas: "#0a0a0a", // App background
    default: "#171717", // Cards, containers
    raised: "#262626", // Elevated elements
    sunken: "#0a0a0a", // Inset areas
    overlay: "rgba(0,0,0,0.8)", // Modal backgrounds
  },

  // Dark mode content colors
  darkContent: {
    emphasis: "#fafafa", // Primary text
    default: "#d4d4d4", // Body text
    muted: "#a3a3a3", // Secondary text
    subtle: "#737373", // Tertiary text
    disabled: "#525252", // Disabled states
    inverse: "#171717", // Text on light backgrounds
  },

  // Dark mode state colors
  darkStates: {
    hover: "rgba(255,255,255,0.05)",
    pressed: "rgba(255,255,255,0.1)",
    focus: "rgba(255,255,255,0.15)",
    selected: "rgba(255,255,255,0.12)",
  },
};
```

**Using Dark Mode:**

```tsx
// Automatic with system preference
<View className="bg-surface-canvas dark:bg-surface-canvas">
  <Text className="text-content-emphasis dark:text-content-emphasis">
    Adapts to dark mode
  </Text>
</View>

// The semantic tokens automatically map to correct dark values
<View className="bg-surface-default">  {/* Light: white, Dark: #171717 */}
  <Text className="text-content-muted">  {/* Adjusts automatically */}
    Secondary text
  </Text>
</View>
```

### Semantic Surface Tokens

Use semantic surface tokens for consistent backgrounds:

| Token             | Light             | Dark              | Use For           |
| ----------------- | ----------------- | ----------------- | ----------------- |
| `surface-canvas`  | `#fafafa`         | `#0a0a0a`         | App background    |
| `surface-default` | `#ffffff`         | `#171717`         | Cards, panels     |
| `surface-raised`  | `#ffffff`         | `#262626`         | Elevated elements |
| `surface-sunken`  | `#f5f5f5`         | `#0a0a0a`         | Inset areas       |
| `surface-overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.8)` | Modals            |

### Semantic Content Tokens

Use semantic content tokens for text:

| Token              | Light     | Dark      | Use For                  |
| ------------------ | --------- | --------- | ------------------------ |
| `content-emphasis` | `#171717` | `#fafafa` | Headings, important text |
| `content-default`  | `#404040` | `#d4d4d4` | Body text                |
| `content-muted`    | `#737373` | `#a3a3a3` | Secondary text           |
| `content-subtle`   | `#a3a3a3` | `#737373` | Hints, placeholders      |
| `content-disabled` | `#d4d4d4` | `#525252` | Disabled states          |

## Typography

### Semantic Font Sizes

The theme includes a semantic typography scale with proper line-heights:

```javascript
// packages/tailwind-config/themes/starter.js
fontSize: {
  // Display sizes (marketing, heroes)
  "display-2xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
  "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
  "display-lg": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
  "display-md": ["2.25rem", { lineHeight: "1.25" }],
  "display-sm": ["1.875rem", { lineHeight: "1.3" }],

  // Headings (UI headings)
  "heading-xl": ["1.5rem", { lineHeight: "1.35" }],
  "heading-lg": ["1.25rem", { lineHeight: "1.4" }],
  "heading-md": ["1.125rem", { lineHeight: "1.45" }],
  "heading-sm": ["1rem", { lineHeight: "1.5" }],

  // Body text
  "body-xl": ["1.25rem", { lineHeight: "1.6" }],
  "body-lg": ["1.125rem", { lineHeight: "1.6" }],
  "body-md": ["1rem", { lineHeight: "1.6" }],
  "body-sm": ["0.875rem", { lineHeight: "1.5" }],
  "body-xs": ["0.75rem", { lineHeight: "1.5" }],

  // Special
  "caption": ["0.75rem", { lineHeight: "1.4" }],
  "overline": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.05em" }],
}
```

**Using Semantic Typography:**

```tsx
// In your components
<Text className="text-display-lg font-bold text-content-emphasis">
  Welcome Back
</Text>

<Text className="text-heading-md font-semibold text-content-emphasis">
  Section Title
</Text>

<Text className="text-body-md text-content-default">
  Body text with comfortable line height
</Text>

<Text className="text-caption text-content-muted">
  Small caption text
</Text>
```

### Typography Component

Use the Typography component for semantic text:

```tsx
import { Typography, HeadingText, BodyText } from "@app/components";

<Typography variant="display-lg" color="emphasis">
  Hero Title
</Typography>

<HeadingText level={2}>Section Heading</HeadingText>

<BodyText size="md" color="muted">
  Secondary description text
</BodyText>
```

### Letter Spacing

```javascript
letterSpacing: {
  tightest: "-0.05em",  // Display text
  tighter: "-0.025em",  // Headings
  tight: "-0.015em",
  normal: "0",
  wide: "0.015em",
  wider: "0.025em",
  widest: "0.05em",
  caps: "0.1em",       // All-caps text
}
```

## Animations

### Built-in Animations

The theme includes enhanced animations for micro-interactions:

```javascript
// packages/tailwind-config/themes/starter.js
keyframes: {
  // Fades
  "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
  "fade-out": { "0%": { opacity: "1" }, "100%": { opacity: "0" } },
  "fade-in-up": {
    "0%": { opacity: "0", transform: "translateY(10px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },
  "fade-in-down": {
    "0%": { opacity: "0", transform: "translateY(-10px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },

  // Scales
  "scale-in": {
    "0%": { opacity: "0", transform: "scale(0.95)" },
    "100%": { opacity: "1", transform: "scale(1)" },
  },
  "scale-out": {
    "0%": { opacity: "1", transform: "scale(1)" },
    "100%": { opacity: "0", transform: "scale(0.95)" },
  },

  // Slides
  "slide-in-right": {
    "0%": { transform: "translateX(100%)" },
    "100%": { transform: "translateX(0)" },
  },
  "slide-out-right": {
    "0%": { transform: "translateX(0)" },
    "100%": { transform: "translateX(100%)" },
  },

  // Feedback
  "shake": {
    "0%, 100%": { transform: "translateX(0)" },
    "25%": { transform: "translateX(-4px)" },
    "75%": { transform: "translateX(4px)" },
  },
  "bounce-soft": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-5px)" },
  },
}
```

**Using Animations:**

```tsx
// Apply animations with Tailwind classes
<View className="animate-fade-in-up">
  <Card>Animates in</Card>
</View>

<Button className="hover:animate-bounce-soft">
  Bounces on hover
</Button>

<Input className="invalid:animate-shake">
  Shakes on error
</Input>
```

### Transition Timing Functions

Custom easing functions for natural movement:

```javascript
transitionTimingFunction: {
  "ease-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",   // General UI
  "ease-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",  // Playful
  "ease-elastic": "cubic-bezier(0.68, -0.6, 0.32, 1.6)",    // Springy
  "ease-snap": "cubic-bezier(0.2, 0, 0, 1)",      // Quick snap
  "ease-in-expo": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
  "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
  "ease-in-out-expo": "cubic-bezier(1, 0, 0, 1)",
}
```

**Using Custom Easings:**

```tsx
<View className="transition-transform duration-300 ease-bounce hover:scale-105">
  Bouncy scale
</View>

<Modal className="transition-all duration-200 ease-snap">
  Snappy modal
</Modal>
```

## Typography

### Fonts

**Web:** Configure in `apps/web/src/app/layout.tsx`

```tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

**Mobile:** Configure in `apps/mobile/app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "expo-font",
        {
          "fonts": ["./assets/fonts/Inter-Regular.ttf"]
        }
      ]
    ]
  }
}
```

### Text Styles

Use Tailwind classes for consistent typography:

```tsx
// Headings
<Text className="text-3xl font-bold text-typography-900">H1</Text>
<Text className="text-2xl font-semibold text-typography-900">H2</Text>
<Text className="text-xl font-medium text-typography-900">H3</Text>

// Body
<Text className="text-base text-typography-700">Body text</Text>
<Text className="text-sm text-typography-500">Secondary text</Text>
<Text className="text-xs text-typography-500">Caption</Text>
```

## Logos & Icons

### App Icons

**Mobile:** Replace these files in `apps/mobile/assets/`:

- `icon.png` - App icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `splash.png` - Splash screen (1284x2778)
- `favicon.png` - Web favicon (48x48)

**Web:** Replace in `apps/web/public/`:

- `favicon.ico` - Browser favicon
- `apple-touch-icon.png` - iOS bookmark icon (180x180)
- `og-image.png` - Social sharing image (1200x630)

### Logo Component

Create a reusable logo component:

```tsx
// packages/ui/src/components/Logo.tsx
import { Image, View } from "react-native";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
}

const sizes = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
};

export function Logo({ size = "md", variant = "icon" }: LogoProps) {
  const dimensions = sizes[size];

  return <Image source={require("../assets/logo.png")} style={dimensions} resizeMode="contain" />;
}
```

## Translations (i18n)

All user-facing text is externalized for easy customization and localization.

### File Structure

```
packages/i18n/src/locales/
├── en/
│   ├── common.json      # Shared strings (buttons, labels)
│   ├── auth.json        # Login, signup, password reset
│   ├── dashboard.json   # Dashboard-specific text
│   └── errors.json      # Error messages
├── es/
│   └── ... (same structure)
└── fr/
    └── ... (add more languages)
```

### Common Translations

**File:** `packages/i18n/src/locales/en/common.json`

```json
{
  "app": {
    "name": "Your App Name",
    "tagline": "Your catchy tagline"
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "submit": "Submit",
    "continue": "Continue",
    "back": "Back"
  },
  "labels": {
    "email": "Email",
    "password": "Password",
    "name": "Name"
  },
  "messages": {
    "loading": "Loading...",
    "success": "Success!",
    "error": "Something went wrong"
  }
}
```

### Using Translations

```tsx
import { useTranslation } from "@app/i18n/mobile"; // or /web

function MyComponent() {
  const { t } = useTranslation("common");

  return (
    <View>
      <Text>{t("app.name")}</Text>
      <Button>{t("buttons.save")}</Button>
    </View>
  );
}
```

### Adding a New Language

1. Create the locale folder:

```bash
mkdir -p packages/i18n/src/locales/fr
```

2. Copy English files and translate:

```bash
cp packages/i18n/src/locales/en/*.json packages/i18n/src/locales/fr/
```

3. Register the language in config:

```typescript
// packages/i18n/src/config.ts
export const languages = ["en", "es", "fr"] as const;
```

## Email Templates

Email templates use React Email for a component-based approach.

**Location:** `packages/mailer/src/templates/`

### Customizing Templates

```tsx
// packages/mailer/src/templates/welcome.tsx
import { Html, Head, Body, Container, Text, Button } from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  appName: string;
}

export function WelcomeEmail({ name, appName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Add your logo */}
          <img src="https://yourdomain.com/logo.png" alt={appName} />

          <Text style={heading}>Welcome to {appName}!</Text>

          <Text style={paragraph}>
            Hi {name}, thanks for signing up. We're excited to have you.
          </Text>

          <Button style={button} href="https://yourdomain.com/dashboard">
            Get Started
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "40px 20px" };
const heading = { fontSize: "24px", fontWeight: "bold" };
const paragraph = { fontSize: "16px", lineHeight: "1.5" };
const button = { backgroundColor: "#4CAF50", color: "#fff", padding: "12px 24px" };
```

## Mobile App Configuration

**File:** `apps/mobile/app.json`

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4CAF50"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp",
      "supportsTablet": true
    },
    "android": {
      "package": "com.yourcompany.yourapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4CAF50"
      }
    }
  }
}
```

## SEO & Metadata

**File:** `apps/web/src/app/layout.tsx`

```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Your App Name",
    template: "%s | Your App Name",
  },
  description: "Your app description for search engines",
  keywords: ["keyword1", "keyword2"],
  authors: [{ name: "Your Company" }],
  openGraph: {
    title: "Your App Name",
    description: "Your app description",
    url: "https://yourdomain.com",
    siteName: "Your App Name",
    images: [
      {
        url: "https://yourdomain.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your App Name",
    description: "Your app description",
    images: ["https://yourdomain.com/og-image.png"],
  },
};
```

## Brand Consistency Checklist

Before launching, verify these are all updated:

### Visual

- [ ] Primary color matches brand guidelines
- [ ] Logo appears correctly on all platforms
- [ ] App icon is unique and recognizable
- [ ] Splash screen shows brand

### Content

- [ ] App name is correct everywhere
- [ ] Tagline/description is compelling
- [ ] All placeholder text is replaced
- [ ] Error messages are helpful

### Technical

- [ ] Bundle identifiers match your domain
- [ ] Email sender name/address is professional
- [ ] Social sharing images are set
- [ ] Favicon is visible in browser

## Next Steps

- **[Deploying](./DEPLOYING.md)** - Get your branded app live
- **[guides/ANALYTICS.md](./guides/ANALYTICS.md)** - Track brand engagement
