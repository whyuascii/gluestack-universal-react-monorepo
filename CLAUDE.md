# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a cross-platform React monorepo using Turborepo, pnpm workspaces, Next.js (web), and Expo (mobile). The codebase enables maximum code sharing between web and mobile platforms using gluestack-v3 UI primitives and NativeWind (Tailwind CSS for React Native).

## Package Manager & Commands

**Package Manager:** pnpm (v10.15.0)

### Root-level Commands
```bash
pnpm dev              # Start all apps in development (web + mobile)
pnpm build            # Build all apps for production
pnpm lint             # Lint all workspaces
pnpm check-types      # TypeScript type checking across all packages
```

### Working with Specific Packages
```bash
# Run commands in specific packages
pnpm --filter web dev          # Next.js web app
pnpm --filter mobile dev       # Expo mobile app
pnpm --filter ui <command>     # UI component library

# Mobile platform-specific (run from apps/mobile/)
cd apps/mobile
pnpm ios              # iOS simulator
pnpm android          # Android emulator
pnpm web              # Web browser (Expo web)
```

### Testing Individual Components
When developing or testing specific components, you can:
- For web: Run `pnpm --filter web dev` and navigate to the component in the browser
- For mobile: Run `pnpm --filter mobile dev` and test on iOS/Android/web platforms

## Repository Structure

```
/
├── apps/
│   ├── mobile/               # Expo React Native app
│   │   ├── src/app/          # Expo Router file-based routing
│   │   │   ├── (tabs)/       # Tab-based navigation
│   │   │   └── _layout.tsx   # Root layout with providers
│   │   ├── global.css        # Global Tailwind styles
│   │   └── tailwind.config.js
│   │
│   └── web/                  # Next.js web app
│       ├── src/app/          # Next.js App Router
│       │   ├── layout.tsx    # Root layout with providers
│       │   ├── page.tsx      # Home page
│       │   └── registry.tsx  # Styled-jsx registry for gluestack
│       ├── globals.css       # Global Tailwind styles
│       ├── next.config.ts    # Next.js config with gluestack adapter
│       └── tailwind.config.js
│
├── packages/
│   ├── ui/                   # Shared UI component library (gluestack-v3)
│   │   ├── src/              # 50+ cross-platform components
│   │   └── index.ts          # Component exports
│   │
│   ├── screens/              # Shared screen components
│   │   ├── src/home/         # Home screen implementations
│   │   └── src/auth/         # Auth screen implementations
│   │
│   ├── tailwind-config/      # Shared Tailwind configuration
│   │   ├── index.js          # Factory function for Tailwind config
│   │   └── package.json      # Package definition
│   │
│   ├── typescript-config/    # Shared TypeScript configuration
│   │   ├── base.json         # Core compiler options
│   │   ├── nextjs.json       # Next.js-specific settings
│   │   ├── expo.json         # Expo/React Native settings
│   │   └── package.json      # Package definition
│   │
│   ├── errors/               # Shared error handling
│   └── service-contracts/    # Shared type definitions/interfaces
│
├── turbo.json                # Turborepo pipeline configuration
└── pnpm-workspace.yaml       # pnpm workspace configuration
```

## Architecture & Key Concepts

### Cross-Platform Strategy

This monorepo achieves web/mobile code sharing through:

1. **Shared UI Components (`packages/ui`)**: gluestack-v3 primitives that work on both web and native
2. **Shared Screens (`packages/screens`)**: Business logic and screen layouts used by both apps
3. **Shared Tailwind Config (`packages/tailwind-config`)**: Centralized theme configuration ensuring visual consistency
4. **Shared TypeScript Config (`packages/typescript-config`)**: Platform-specific TypeScript configurations (Next.js vs Expo)
5. **NativeWind**: Enables Tailwind CSS classes on React Native (both apps use identical theme)
6. **React Native Web**: Transpiles React Native components to web (configured in `next.config.ts`)

### Package Dependencies

- **pnpm overrides** (root `package.json`): Enforces consistent versions across the monorepo
  - React 19.1.0
  - React Native 0.81.4
  - React Native Web 0.21.1
  - Tailwind CSS 3.4.17
  - NativeWind 4.2.1

- **Workspace dependencies**: Packages reference each other via `workspace:*` protocol
  - Both apps depend on `ui` and `screens` packages

### Next.js Configuration

The web app's `next.config.ts` includes critical setup:

1. **`withGluestackUI` adapter**: Enables gluestack components on web
2. **`transpilePackages`**: Transpiles workspace packages and React Native libraries
3. **Webpack alias**: Maps `react-native` → `react-native-web`
4. **File extensions**: Prioritizes `.web.*` files for web-specific implementations

### Expo Configuration

The mobile app uses:

1. **Expo Router**: File-based routing (similar to Next.js)
2. **Expo SDK 54**: Latest stable version
3. **File-based navigation**: Screens in `src/app/(tabs)/` directory

### Styling System

**Shared Tailwind Configuration (`packages/tailwind-config`):**

The monorepo uses a centralized Tailwind configuration package that ensures styling consistency across all platforms. The configuration is exported as a factory function that both apps consume.

**How it works:**

```javascript
// packages/tailwind-config/index.js
module.exports = function createTailwindConfig(options = {}) {
  const { content = [], important } = options;

  return {
    // Shared package paths automatically included
    content: [
      "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
      "../../packages/screens/src/**/*.{js,jsx,ts,tsx}",
      ...content, // App-specific paths
    ],
    // Full theme configuration...
  };
};
```

Apps consume the shared config:

```javascript
// apps/web/tailwind.config.js
const createTailwindConfig = require("tailwind-config");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{html,js,jsx,ts,tsx,mdx}"],
  important: "html", // Web-specific setting
});
```

**Theme features:**

- **CSS Variables**: Custom color system using RGB CSS variables
  - `primary-*`, `secondary-*`, `error-*`, `success-*`, `warning-*`, `info-*`
  - `typography-*`, `outline-*`, `background-*`, `indicator-*`
  - All colors have shades from 0-950

- **Dark Mode**: Controlled via `DARK_MODE` environment variable (defaults to `"class"`)
- **Safelist**: Ensures all semantic color classes are included in builds
- **Font Families**: Defined but fonts loaded differently per platform
- **Custom Shadows**: `hard-*` and `soft-*` shadow utilities (1-5 variants)

**Benefits:**
- Single source of truth for theme (colors, fonts, shadows, etc.)
- Theme changes propagate automatically to both platforms
- Apps can't accidentally exclude shared package paths
- Platform-specific overrides still possible via the factory options

### Provider Setup

Both apps wrap their content with the same providers (in the same order):

```tsx
<GluestackUIProvider mode="light">
  <SafeAreaProvider>
    {/* App content */}
  </SafeAreaProvider>
</GluestackUIProvider>
```

For web, an additional `StyledJsxRegistry` wraps everything for Next.js 15 compatibility.

## Development Workflow

### Adding New Components to UI Package

1. Create component directory in `packages/ui/src/<component-name>/`
2. Export from `packages/ui/src/index.ts`
3. Component will be automatically available in both apps via `import { Component } from "ui"`

### Creating Shared Screens

1. Add screen to `packages/screens/src/<feature>/`
2. Export from `packages/screens/src/index.ts`
3. Import in app-specific routing:
   - Web: `apps/web/src/app/` (Next.js App Router)
   - Mobile: `apps/mobile/src/app/` (Expo Router)

### Modifying the Theme

All theme customizations (colors, fonts, shadows, etc.) are centralized in `packages/tailwind-config/index.js`:

**To update theme colors:**
1. Edit `packages/tailwind-config/index.js`
2. Modify the `colors` object in `theme.extend`
3. Changes apply to both apps immediately (hot reload works)

**To add new theme values:**
```javascript
// packages/tailwind-config/index.js
theme: {
  extend: {
    colors: { /* existing colors */ },
    spacing: {
      '128': '32rem', // Add custom spacing
    },
    animation: {
      'spin-slow': 'spin 3s linear infinite', // Add custom animation
    }
  }
}
```

**For app-specific theme overrides:**
```javascript
// apps/web/tailwind.config.js
const baseConfig = require("tailwind-config")({ content: [...] });

module.exports = {
  ...baseConfig,
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme.extend,
      // Web-only additions
      colors: {
        ...baseConfig.theme.extend.colors,
        'web-specific': '#custom',
      }
    }
  }
};
```

### Modifying TypeScript Settings

All shared TypeScript compiler options are centralized in `packages/typescript-config/`:

**To update compiler options for all projects:**
1. Edit `packages/typescript-config/base.json`
2. Add/modify compiler options
3. Changes apply immediately to all apps and packages

**To update Next.js-specific settings:**
1. Edit `packages/typescript-config/nextjs.json`
2. Only affects the web app

**To update Expo/React Native settings:**
1. Edit `packages/typescript-config/expo.json`
2. Affects mobile app and all packages (ui, screens)

**For app-specific TypeScript overrides:**
```json
// apps/web/tsconfig.json
{
  "extends": "typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],        // App-specific path aliases
      "@components/*": ["./src/components/*"]
    },
    "baseUrl": "."               // App-specific setting
  }
}
```

**Note:** Avoid duplicating compiler options already in the shared configs. Only add app-specific settings like paths, baseUrl, or includes.

### Platform-Specific Code

When needed, use file extensions or platform detection:

```tsx
// File-based: component.web.tsx / component.native.tsx
// Runtime: Platform.OS === 'web' | 'ios' | 'android'
```

### TypeScript Configuration

**Shared TypeScript Configuration (`packages/typescript-config`):**

The monorepo uses a Turborepo-style TypeScript configuration with platform-specific configs. Each config is a JSON file that apps/packages extend from.

**Configuration files:**

1. **`base.json`** - Core compiler options shared by all projects:
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

2. **`nextjs.json`** - Extends base.json, adds Next.js-specific settings:
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "nativewind",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  }
}
```

3. **`expo.json`** - Extends Expo's base config with our strict mode:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noEmit": true
  }
}
```

**How apps/packages use it:**

```json
// apps/web/tsconfig.json (Next.js app)
{
  "extends": "typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
}

// apps/mobile/tsconfig.json (Expo app)
{
  "extends": "typescript-config/expo.json",
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts"]
}

// packages/ui/tsconfig.json & packages/screens/tsconfig.json
{
  "extends": "typescript-config/expo.json",
  "include": ["src/**/*"]
}
```

**Benefits:**
- Platform-specific configs (Next.js vs Expo) clearly defined
- Compiler options centralized - update once, applies everywhere
- Apps/packages reduced to minimal configs (just paths and includes)
- Follows Turborepo best practices for monorepo TypeScript configs

### Build Caching

Turborepo caches build outputs:
- Web: `.next/**` (excluding cache)
- Task dependencies defined in `turbo.json`

## Important Notes

### Version Constraints

Always respect the pnpm overrides in root `package.json`. These versions are locked for compatibility:
- React 19 requires specific native module versions
- NativeWind 4.x requires Tailwind 3.x

### gluestack Component Conditionals

Some components are commented out in `packages/ui/src/index.ts`:
- `accordion`, `actionsheet`: Not yet implemented
- `bottomsheet`, `input-accessory-view`: Expo-only (no web support)
- `select`, `table`: Currently disabled

### Build Errors to Ignore

`next.config.ts` has:
```ts
eslint: { ignoreDuringBuilds: true }
typescript: { ignoreBuildErrors: true }
```

This is intentional for faster builds during development. Remove when stabilizing.

### React Native Web Limitations

Not all React Native components work on web. The UI package selectively exports components known to work cross-platform. When adding new components, test on both platforms.

## Common Issues

### Module Resolution

If imports fail:
1. Check `pnpm-workspace.yaml` includes the package path
2. Verify `package.json` has `"main"` and `"types"` fields pointing to entry
3. Run `pnpm install` from root to update workspace links

### Tailwind Classes Not Working

1. Check if the file is in an app-specific location that needs to be added to the app's `tailwind.config.js` content array
2. The shared packages (`ui` and `screens`) are automatically included via `packages/tailwind-config/index.js`
3. Ensure `global.css` (mobile) or `globals.css` (web) imports Tailwind directives
4. If you modified `packages/tailwind-config/index.js`, restart the dev server to pick up changes
5. Verify both apps have `tailwind-config: "workspace:*"` in their `devDependencies`

### TypeScript Errors

If TypeScript is not recognizing the shared config:
1. Verify the app/package has `typescript-config: "workspace:*"` in `devDependencies`
2. Run `pnpm install` from root to ensure workspace linking
3. Check that `tsconfig.json` extends the correct config:
   - Web app should extend `typescript-config/nextjs.json`
   - Mobile app and packages should extend `typescript-config/expo.json`
4. Restart your TypeScript server (VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server")

If you need to modify compiler options:
- **DO NOT** add compiler options directly to app/package `tsconfig.json` files
- **DO** update the shared config in `packages/typescript-config/`
- Only add app-specific settings like `paths`, `baseUrl`, or `include` to individual configs

### Platform-Specific Bugs

Use `pnpm --filter mobile dev` to test all three platforms (iOS/Android/web) before assuming mobile-only issues.
