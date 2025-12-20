# Cross-Platform Strategy

This document explains how the monorepo achieves **80%+ code sharing** between web and mobile platforms.

## Overview

The monorepo uses a multi-layered approach to maximize code reuse:

1. **Shared components** - gluestack UI v3 primitives work on both platforms
2. **Shared business logic** - Screens, hooks, state management in `ui` package
3. **Shared utilities** - Pure functions in `utils` package
4. **Shared types** - Type definitions in `service-contracts` package
5. **Unified styling** - Tailwind CSS via NativeWind on React Native
6. **Platform-specific code when needed** - File extensions or runtime checks

## Code Sharing Layers

```
┌─────────────────────────────────────────────────────┐
│                  Applications                        │
│  ┌──────────────┐              ┌──────────────┐    │
│  │  Web         │              │  Mobile      │    │
│  │  (Next.js)   │              │  (Expo)      │    │
│  └──────────────┘              └──────────────┘    │
│         │                              │            │
│         └──────────────┬───────────────┘            │
│                        │                            │
├─────────────────────────────────────────────────────┤
│              Shared Business Logic                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  ui package                                   │  │
│  │  - Screens (home, auth, settings)            │  │
│  │  - Hooks (useAuth, useUser, useApi)          │  │
│  │  - State (Zustand stores)                    │  │
│  │  - Utils (formatters, validators)            │  │
│  └──────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│               Shared Components                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  components package                           │  │
│  │  - Gluestack UI v3 primitives                │  │
│  │  - Custom components                         │  │
│  │  - Works on web + mobile                     │  │
│  └──────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│            Shared Utilities & Types                  │
│  ┌──────────────────────────────────────────────┐  │
│  │  utils, service-contracts, errors            │  │
│  │  - Pure functions                            │  │
│  │  - Type definitions                          │  │
│  │  - Error classes                             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Shared Components

### gluestack UI v3

The `components` package uses **gluestack UI v3**, which provides true cross-platform components:

```tsx
// packages/components/src/button/index.tsx
import { Button, ButtonText } from "@gluestack-ui/themed";

export function PrimaryButton({ children, onPress, ...props }) {
  return (
    <Button className="bg-primary-500 px-4 py-2 rounded-lg" onPress={onPress} {...props}>
      <ButtonText className="text-white font-medium">{children}</ButtonText>
    </Button>
  );
}
```

**This component works identically on:**

- Next.js (web) - Renders as `<button>` with styled-jsx
- Expo (mobile) - Renders as React Native `<Pressable>`

### How It Works

1. **gluestack-ui-adapter** (web) - Transpiles gluestack components to web
2. **React Native Web** - Converts React Native primitives to HTML/CSS
3. **NativeWind** - Applies Tailwind classes on both platforms

## Unified Styling

### NativeWind + Tailwind CSS

Both web and mobile use **identical Tailwind classes**:

```tsx
// Works on both platforms!
<View className="flex-1 bg-background-0 p-4">
  <Text className="text-typography-900 text-xl font-bold mb-2">Hello World</Text>
  <Button className="bg-primary-500 px-6 py-3 rounded-lg">
    <ButtonText className="text-white">Click Me</ButtonText>
  </Button>
</View>
```

### Shared Tailwind Configuration

The `tailwind-config` package ensures both apps use the same theme:

```javascript
// packages/tailwind-config/index.js
module.exports = function createTailwindConfig(options = {}) {
  return {
    theme: {
      extend: {
        colors: {
          primary: {
            0: "rgb(var(--color-primary-0) / <alpha-value>)",
            50: "rgb(var(--color-primary-50) / <alpha-value>)",
            // ... 500, 600, 700, etc.
          },
          // Typography, background, outline, etc.
        },
      },
    },
  };
};
```

**Both apps consume it:**

```javascript
// apps/web/tailwind.config.js
const createTailwindConfig = require("@app/tailwind-config");
module.exports = createTailwindConfig({
  content: ["./src/**/*.{ts,tsx}"],
});

// apps/mobile/tailwind.config.js
const createTailwindConfig = require("@app/tailwind-config");
module.exports = createTailwindConfig({
  content: ["./src/**/*.{ts,tsx}"],
});
```

## Shared Business Logic

### Screens

The `ui` package contains screen implementations:

```tsx
// packages/ui/src/home/HomeScreen.tsx
import { View, Text } from "react-native";
import { PrimaryButton } from "@app/components";

export function HomeScreen() {
  const { user } = useAuth();

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Welcome, {user?.name}!</Text>
      <PrimaryButton onPress={handleAction}>Get Started</PrimaryButton>
    </View>
  );
}
```

**Used in both apps:**

```tsx
// apps/web/src/app/page.tsx
import { HomeScreen } from "@app/ui";
export default function Page() {
  return <HomeScreen />;
}

// apps/mobile/src/app/(tabs)/index.tsx
import { HomeScreen } from "@app/ui";
export default function TabOneScreen() {
  return <HomeScreen />;
}
```

### Hooks

Custom hooks are shared:

```typescript
// packages/ui/src/hooks/useAuth.ts
import { createAuthClient } from "auth/client/react"; // or auth/client/native

export function useAuth() {
  const [user, setUser] = useState(null);

  const signIn = async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    setUser(result.user);
  };

  return { user, signIn, signOut };
}
```

**Works on both platforms because:**

1. React hooks are platform-agnostic
2. `auth` package exports both `auth/client/react` and `auth/client/native`
3. Apps import the appropriate client based on platform

## Platform-Specific Code

### Method 1: File Extensions

Create platform-specific implementations:

```
components/
  src/
    button/
      index.tsx           # Default (shared)
      index.web.tsx       # Web-specific
      index.native.tsx    # Native-specific
```

**The build system automatically resolves:**

- Web: `index.web.tsx` → `index.tsx`
- Mobile: `index.native.tsx` → `index.tsx`

### Method 2: Runtime Platform Detection

Use React Native's `Platform` API:

```tsx
import { Platform } from "react-native";

export function PlatformSpecificComponent() {
  if (Platform.OS === "web") {
    return <WebOnlyComponent />;
  }

  return <MobileComponent />;
}
```

### Method 3: Conditional Exports

Package exports can be platform-specific:

```json
// packages/auth/package.json
{
  "exports": {
    ".": "./src/index.ts",
    "./client/react": "./src/client/react.ts",
    "./client/native": "./src/client/native.ts"
  }
}
```

**Apps import the right version:**

```typescript
// Web
import { createAuthClient } from "auth/client/react";

// Mobile
import { createAuthClient } from "auth/client/native";
```

## Provider Setup

Both apps use the same provider structure:

```tsx
// apps/web/src/app/layout.tsx
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyledJsxRegistry } from "./registry";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <StyledJsxRegistry>
          <GluestackUIProvider mode="light">
            <SafeAreaProvider>{children}</SafeAreaProvider>
          </GluestackUIProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}

// apps/mobile/src/app/_layout.tsx
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <SafeAreaProvider>
        <Stack />
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}
```

**Note:** Web needs `StyledJsxRegistry` for Next.js 15 compatibility with gluestack.

## React Native Web Configuration

### Next.js Configuration

The web app transpiles React Native code:

```typescript
// apps/web/next.config.ts
import { withGluestackUI } from "@gluestack/ui-next-adapter";

const config = {
  transpilePackages: [
    "components",
    "ui",
    "react-native",
    "react-native-web",
    "react-native-safe-area-context",
    "nativewind",
    "@gluestack-ui/themed",
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-native$": "react-native-web",
    };

    config.resolve.extensions = [
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ...config.resolve.extensions,
    ];

    return config;
  },
};

export default withGluestackUI(config);
```

**What this does:**

1. **transpilePackages** - Transpiles workspace packages and React Native libraries
2. **alias** - Maps `react-native` → `react-native-web`
3. **extensions** - Prioritizes `.web.*` files for web builds
4. **withGluestackUI** - Wraps config to enable gluestack on web

## File-Based Routing

Both apps use file-based routing:

### Next.js App Router (Web)

```
apps/web/src/app/
  layout.tsx          # Root layout
  page.tsx            # Home page (/)
  auth/
    signin/
      page.tsx        # /auth/signin
    signup/
      page.tsx        # /auth/signup
```

### Expo Router (Mobile)

```
apps/mobile/src/app/
  _layout.tsx         # Root layout
  (tabs)/             # Tab navigator
    index.tsx         # Tab 1
    two.tsx           # Tab 2
  auth/
    signin.tsx        # auth/signin
    signup.tsx        # auth/signup
```

**Differences:**

- Next.js uses `page.tsx` for routes
- Expo uses filename as route (e.g., `signin.tsx` → `/auth/signin`)
- Expo supports `(tabs)` for navigation groups

## Benefits of This Approach

### 1. Code Reuse (80%+)

- Components: 100% shared
- Business logic: 100% shared (screens, hooks, state)
- Utilities: 100% shared
- Platform-specific code: ~20% (navigation, some native features)

### 2. Consistent User Experience

- Same design system (Tailwind theme)
- Same components
- Same behavior
- Same data flow

### 3. Single Source of Truth

- Bug fixes apply to both platforms
- Feature additions work everywhere
- Design changes propagate automatically

### 4. Developer Experience

- Write once, works everywhere
- Hot reload on both platforms
- Type safety across all code
- Easy to test in isolation

## Limitations & Workarounds

### Not All React Native Components Work on Web

**Problem:** Some React Native components don't have web equivalents.

**Solution:** Use gluestack UI v3 primitives which abstract platform differences.

### Platform-Specific APIs

**Problem:** Camera, push notifications, etc. only work on mobile.

**Solution:** Use platform detection and provide graceful fallbacks:

```tsx
if (Platform.OS !== "web") {
  // Use camera
} else {
  // Show file upload
}
```

### Navigation Differences

**Problem:** Next.js routing ≠ React Navigation.

**Solution:** Keep routing in apps, share screen components:

```tsx
// App handles routing, screen is shared
<Route path="/home" component={HomeScreen} />
```

### Build Configuration

**Problem:** Different bundlers (webpack vs Metro).

**Solution:** Configure both to handle the same file extensions and transpilation.

## Best Practices

### DO:

- Use gluestack UI components for cross-platform UI
- Keep business logic in the `ui` package
- Use Tailwind classes for styling
- Test on both platforms regularly
- Use platform-specific files when needed

### DON'T:

- Import platform-specific libraries in shared code
- Use web-only CSS or HTML tags in shared components
- Assume all React Native APIs work on web
- Skip testing on one platform

## Related Documentation

- [Architecture Overview](./overview.md)
- [Monorepo Structure](./monorepo-structure.md)
- [Adding Components Guide](../guides/adding-components.md)
- [Components Package](../packages/components.md)
