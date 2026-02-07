# Mobile App

Expo React Native mobile application with NativeWind styling and Gluestack UI components.

**Tech Stack:** Expo SDK 54, React Native 0.81, NativeWind 4, Gluestack UI v3

## Quick Start

```bash
# From repository root
pnpm --filter mobile dev

# Or from this directory
pnpm dev         # Start Metro bundler
pnpm dev:clear   # Clear cache and start
pnpm ios         # iOS simulator
pnpm android     # Android emulator
pnpm web         # Expo Web
```

## Initial Setup (Required for New Projects)

When cloning this boilerplate, you **must** create your own Expo project and update the configuration:

### 1. Create Your Expo Project

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Initialize a new EAS project (creates project on Expo servers)
eas init
```

This will prompt you to create a new project and give you a **Project ID**.

### 2. Update app.config.js

Open `app.config.js` and update these values:

```javascript
export default ({ config }) => {
  return {
    ...config,
    expo: {
      ...config.expo,
      // Change these to your app's name
      name: "Your App Name",
      slug: "your-app-slug",

      // Update bundle identifiers
      ios: {
        bundleIdentifier: "com.yourcompany.yourapp",
        // ...
      },
      android: {
        package: "com.yourcompany.yourapp",
        // ...
      },

      extra: {
        // ...
        eas: {
          // Paste your Project ID from eas init here
          projectId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        },
      },

      // Your Expo username
      owner: "your-expo-username",
    },
  };
};
```

### 3. Update eas.json (if needed)

If you have specific build profiles, update `eas.json` with your app's configuration.

### 4. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update the values in `.env` with your API keys.

### Key Configuration Values to Change

| Value              | Location                  | Description                           |
| ------------------ | ------------------------- | ------------------------------------- |
| `name`             | app.config.js             | Display name of your app              |
| `slug`             | app.config.js             | URL-friendly name (used in Expo URLs) |
| `bundleIdentifier` | app.config.js (ios)       | iOS bundle ID (com.company.app)       |
| `package`          | app.config.js (android)   | Android package name                  |
| `projectId`        | app.config.js (extra.eas) | From `eas init`                       |
| `owner`            | app.config.js             | Your Expo account username            |

### AdMob Setup (Optional)

If using AdMob for mobile ads, update these in `.env`:

```bash
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-xxxxx~xxxxx
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-xxxxx~xxxxx
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID=ca-app-pub-xxxxx/xxxxx
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=ca-app-pub-xxxxx/xxxxx
```

## Project Structure

```
src/
└── app/                      # Expo Router screens (file-based routing)
    ├── _layout.tsx           # Root layout with all providers
    ├── index.tsx             # Entry point (redirects based on auth)
    ├── +not-found.tsx        # 404 screen
    ├── (auth)/               # Auth flow (unauthenticated users)
    │   ├── _layout.tsx
    │   ├── login.tsx
    │   ├── signup.tsx
    │   ├── verify-email.tsx
    │   └── reset-password.tsx
    ├── (app)/                # Main app (authenticated users)
    │   ├── _layout.tsx
    │   └── dashboard.tsx
    ├── (tabs)/               # Tab navigation
    │   └── ...
    └── (group)/              # Group/tenant management
        ├── create.tsx
        ├── invite-members.tsx
        └── accept.tsx
```

## Monorepo Packages

This app uses shared packages:

| Package              | Import                    | Purpose                   |
| -------------------- | ------------------------- | ------------------------- |
| `@app/ui`            | Screens, hooks, stores    | Business logic layer      |
| `@app/components`    | UI primitives             | Gluestack components      |
| `@app/auth`          | `@app/auth/client/native` | Better Auth client        |
| `@app/i18n`          | `@app/i18n/mobile`        | i18next with AsyncStorage |
| `@app/analytics`     | `@app/analytics/mobile`   | PostHog React Native      |
| `@app/subscriptions` | RevenueCat                | In-app purchases          |
| `@app/notifications` | Novu + Expo Push          | Push notifications        |

## Building with EAS

### Development Build (for testing native modules)

```bash
pnpm build:dev:ios      # iOS Simulator
pnpm build:dev:android  # Android (internal)
```

### Preview Build (TestFlight/internal testing)

```bash
pnpm build:preview:ios
pnpm build:preview:android
```

### Production Build

```bash
pnpm build:prod:ios
pnpm build:prod:android
```

### Submit to Stores

```bash
pnpm submit:ios       # App Store Connect
pnpm submit:android   # Google Play
```

## Configuration Files

| File                  | Purpose                    |
| --------------------- | -------------------------- |
| `app.json`            | Expo configuration         |
| `eas.json`            | EAS Build profiles         |
| `metro.config.cjs`    | Metro bundler (NativeWind) |
| `babel.config.cjs`    | Babel configuration        |
| `tailwind.config.cjs` | Tailwind/NativeWind theme  |

## Styling with NativeWind

Uses Tailwind CSS classes on React Native components:

```tsx
<View className="flex-1 bg-background-50 p-4">
  <Text className="text-2xl font-bold text-typography-900">Styled with Tailwind</Text>
</View>
```

## Troubleshooting

### "Project not found" or EAS Build Errors

If you see errors about project not found or invalid project ID:

1. Make sure you ran `eas init` to create your project
2. Verify `extra.eas.projectId` in `app.config.js` matches your Expo dashboard
3. Check that `owner` matches your Expo username

### "Failed to resolve plugin" Errors

If you see plugin resolution errors (e.g., for `react-native-google-mobile-ads`):

```bash
# Install dependencies
pnpm install

# Clear cache and restart
pnpm dev:clear
```

### General Fixes

```bash
# Clear caches and restart
pnpm dev:clear

# Check for issues
pnpm doctor

# Full clean
pnpm clean && rm -rf node_modules && pnpm install
```

## Documentation

See [docs/guides/MOBILE.md](../../docs/guides/MOBILE.md) for complete documentation including:

- Provider setup
- Route constants
- i18n usage
- App store submission checklist

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [Gluestack UI](https://gluestack.io/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
