# Mobile App Guide

Complete guide for developing, building, and deploying the Expo mobile app in this monorepo.

**Tech Stack:** Expo SDK 54, React Native 0.81, NativeWind 4, Gluestack UI v3

---

## Quick Start

```bash
# From repository root
pnpm dev                     # Start all apps (recommended)
pnpm --filter mobile dev     # Start mobile only

# Platform-specific
cd apps/mobile
pnpm ios                     # iOS simulator
pnpm android                 # Android emulator
```

---

## Project Structure

```
apps/mobile/
├── src/
│   └── app/                  # Expo Router screens (file-based routing)
│       ├── _layout.tsx       # Root layout with all providers
│       ├── index.tsx         # Entry point (redirects based on auth)
│       ├── +not-found.tsx    # 404 screen
│       ├── (auth)/           # Auth flow group (unauthenticated users)
│       │   ├── _layout.tsx
│       │   ├── login.tsx
│       │   ├── signup.tsx
│       │   ├── verify-email.tsx
│       │   └── reset-password.tsx
│       ├── (app)/            # Main app group (authenticated users)
│       │   ├── _layout.tsx
│       │   └── dashboard.tsx
│       ├── (tabs)/           # Tab navigation (if using tabs)
│       │   ├── _layout.tsx
│       │   └── ...
│       └── (group)/          # Group/tenant management
│           ├── create.tsx
│           ├── invite-members.tsx
│           └── accept.tsx
├── assets/                   # Images, fonts, icons
│   └── images/
│       ├── icon.png          # App icon (1024x1024)
│       ├── adaptive-icon.png # Android adaptive icon
│       ├── splash-icon.png   # Splash screen icon
│       └── favicon.png       # Web favicon
├── global.css                # Tailwind/NativeWind styles
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build configuration
├── metro.config.cjs          # Metro bundler config (NativeWind)
├── babel.config.cjs          # Babel config
├── tailwind.config.cjs       # Tailwind configuration
└── package.json
```

---

## Monorepo Package Integration

The mobile app uses shared packages from the monorepo:

### Core Packages

| Package              | Import                  | Purpose                            |
| -------------------- | ----------------------- | ---------------------------------- |
| `@app/ui`            | `@app/ui`               | Screens, hooks, stores, API client |
| `@app/components`    | `@app/components`       | Gluestack UI primitives            |
| `@app/auth`          | `@app/auth`             | Better Auth native client          |
| `@app/i18n`          | `@app/i18n/mobile`      | i18next with AsyncStorage          |
| `@app/analytics`     | `@app/analytics/mobile` | PostHog React Native               |
| `@app/subscriptions` | `@app/subscriptions`    | RevenueCat integration             |
| `@app/notifications` | `@app/notifications`    | Novu + Expo Push notifications     |
| `@app/core-contract` | `@app/core-contract`    | oRPC contracts and shared types    |

### Platform-Specific Imports

Some packages have platform-specific exports:

```tsx
// Auth client - use native version
import { authClient } from "@app/auth/client/native";

// i18n - use mobile version (AsyncStorage detector)
import i18n from "@app/i18n/mobile";

// Analytics - use mobile version (posthog-react-native)
import { PostHogProvider } from "@app/analytics/mobile";
```

---

## Root Layout Architecture

The root layout (`src/app/_layout.tsx`) sets up all providers:

```tsx
import { GluestackUIProvider } from "@app/components";
import i18n from "@app/i18n/mobile";
import { RevenueCatProvider } from "@app/subscriptions";
import { AnalyticsProvider } from "@app/ui/analytics-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <AnalyticsProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider mode="light">
            <SafeAreaProvider>
              <Slot />
            </SafeAreaProvider>
          </GluestackUIProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </AnalyticsProvider>
  );
}
```

**Provider Order (innermost to outermost):**

1. `RevenueCatProvider` - Subscriptions (needs userId)
2. `SafeAreaProvider` - Safe area insets
3. `GluestackUIProvider` - Component theming
4. `QueryClientProvider` - TanStack Query
5. `I18nextProvider` - Internationalization
6. `PostHogProvider` - Analytics

---

## Route Constants

Use shared route constants from `@app/ui` for type-safe navigation:

```tsx
import { MOBILE_ROUTES } from "@app/ui";

// Navigate to routes
router.push(MOBILE_ROUTES.AUTH_LOGIN); // /(auth)/login
router.push(MOBILE_ROUTES.APP_DASHBOARD); // /(app)/dashboard
router.push(MOBILE_ROUTES.GROUP_CREATE); // /(group)/create
```

---

## Environment Variables

### Local Development

Create `apps/mobile/.env`:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3030

# Analytics (PostHog)
EXPO_PUBLIC_POSTHOG_KEY=phc_xxx
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Subscriptions (RevenueCat)
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_xxx

# Notifications (Novu + Expo Push)
EXPO_PUBLIC_NOVU_APP_ID=xxx

# Demo Mode (optional - bypass auth for testing)
EXPO_PUBLIC_DEMO_MODE=false
```

### EAS Build Secrets

For production builds, set secrets in EAS:

```bash
# Set individual secrets
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://api.yourapp.com"
eas secret:create --name EXPO_PUBLIC_POSTHOG_KEY --value "phc_xxx"

# Or push from file
eas secret:push --env-file .env.production
```

### Accessing Variables

```tsx
// In code
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === "true";

// In app.json/app.config.js
{
  "extra": {
    "apiUrl": process.env.EXPO_PUBLIC_API_URL
  }
}
```

---

## Configuration Files

### app.json (Production-Ready)

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "yourapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourcompany.yourapp",
      "buildNumber": "1",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSUserTrackingUsageDescription": "This helps us improve the app experience."
      }
    },
    "android": {
      "package": "com.yourcompany.yourapp",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      "expo-font",
      "expo-web-browser",
      "expo-localization",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 35,
            "targetSdkVersion": 35
          },
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    },
    "owner": "your-expo-username"
  }
}
```

### eas.json

```json
{
  "cli": {
    "appVersionSource": "local"
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production",
        "releaseStatus": "completed"
      }
    }
  },
  "build": {
    "base": {
      "node": "20.18.1"
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:3030"
      },
      "android": {
        "withoutCredentials": true
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "extends": "base",
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://staging-api.yourapp.com"
      }
    },
    "production": {
      "extends": "base",
      "android": {
        "buildType": "app-bundle",
        "resourceClass": "medium"
      },
      "ios": {
        "resourceClass": "large"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.yourapp.com"
      }
    }
  }
}
```

---

## NativeWind / Tailwind Setup

This project uses NativeWind 4 for styling. Configuration is already set up:

### metro.config.cjs

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

### babel.config.cjs

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: ["react-native-worklets/plugin"],
  };
};
```

### tailwind.config.cjs

```js
const { theme } = require("@app/tailwind-config");

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
    "../../packages/components/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: theme.extend,
  },
};
```

---

## Building with EAS

### Development Build (for testing native modules)

```bash
# iOS Simulator
eas build --platform ios --profile development

# Android (internal distribution)
eas build --platform android --profile development
```

### Preview Build (for TestFlight/internal testing)

```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

### Production Build

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Submit to Stores

```bash
eas submit --platform ios      # App Store Connect
eas submit --platform android  # Google Play
```

---

## Internationalization

The mobile app uses `@app/i18n/mobile` which includes:

- AsyncStorage-based language detection and persistence
- Automatic device locale detection
- Support for English (en) and Spanish (es)

### Using Translations

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation("auth");

  return <Text>{t("login.title")}</Text>;
}
```

### Available Namespaces

| Namespace    | Content                            |
| ------------ | ---------------------------------- |
| `common`     | Shared UI strings, buttons, labels |
| `auth`       | Login, signup, password reset      |
| `validation` | Form validation messages           |
| `group`      | Group/tenant management            |
| `dashboard`  | Dashboard screens                  |

### Adding New Translations

1. Add keys to `packages/i18n/src/locales/en/<namespace>.json`
2. Add translations to `packages/i18n/src/locales/es/<namespace>.json`
3. Rebuild: `pnpm --filter @app/i18n build`

---

## Common Patterns

### Screen with Auth Check

```tsx
import { useSession } from "@app/ui";
import { Redirect } from "expo-router";

export default function ProtectedScreen() {
  const { data: session, isPending } = useSession();

  if (isPending) return <LoadingSpinner />;
  if (!session) return <Redirect href="/(auth)/login" />;

  return <YourContent />;
}
```

### Using Shared Screens

```tsx
// In apps/mobile/src/app/(auth)/login.tsx
import { LoginScreen } from "@app/ui";

export default function LoginPage() {
  return <LoginScreen />;
}
```

### Form with Validation

```tsx
import { FormField, PrimaryButton } from "@app/components";
import { useTranslation } from "react-i18next";

function MyForm() {
  const { t } = useTranslation("validation");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  return (
    <FormField
      label={t("common:email")}
      value={email}
      onChangeText={setEmail}
      error={error}
      keyboardType="email-address"
    />
  );
}
```

---

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear all caches
pnpm --filter mobile clean
rm -rf node_modules/.cache
npx expo start --clear
```

### NativeWind Styles Not Applying

1. Ensure `global.css` is imported in root layout
2. Check `tailwind.config.cjs` content paths include package paths
3. Restart Metro with cache clear

### "Native module not found"

You're likely running in Expo Go. Create a development build:

```bash
eas build --platform ios --profile development
```

### iOS Simulator Issues

```bash
# Reset all simulators
xcrun simctl erase all

# Rebuild
npx expo run:ios --device
```

### Package Not Found

Packages must be built before the mobile app can use them:

```bash
# Build all packages
pnpm build

# Or build specific package
pnpm --filter @app/ui build
```

---

## App Store Submission Checklist

### iOS App Store

- [ ] `ITSAppUsesNonExemptEncryption: false` in app.json
- [ ] Privacy policy URL added to App Store Connect
- [ ] Screenshots for required device sizes
- [ ] App preview video (optional)
- [ ] Keywords (100 char max)
- [ ] In-app purchases tested in sandbox
- [ ] Restore Purchases works
- [ ] TestFlight tested on real devices

### Google Play Store

- [ ] Target SDK 35+ in expo-build-properties
- [ ] Privacy policy URL in Play Console AND app
- [ ] Data safety form completed
- [ ] Content rating questionnaire done
- [ ] Screenshots for phone and tablet
- [ ] App signing enabled (EAS handles this)

### Both Platforms

- [ ] App icon (1024x1024)
- [ ] Splash screen configured
- [ ] No crashes (test offline mode)
- [ ] No placeholder content
- [ ] Deep links work
- [ ] Push notifications work

---

## Commands Reference

```bash
# Development
pnpm --filter mobile dev       # Start Expo dev server
npx expo start --clear         # Clear cache and start
npx expo run:ios               # Run on iOS simulator
npx expo run:android           # Run on Android emulator

# Building
eas build --platform ios --profile development
eas build --platform ios --profile production
eas build --platform android --profile production

# Submitting
eas submit --platform ios
eas submit --platform android

# Utilities
npx expo install --fix         # Fix dependency versions
npx expo-doctor                # Check for issues
eas secret:list                # List EAS secrets
```

---

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [Gluestack UI](https://gluestack.io/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/console/about/guides/quality/)
