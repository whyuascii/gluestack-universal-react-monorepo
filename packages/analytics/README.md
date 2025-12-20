# Analytics Package

Cross-platform analytics package using PostHog for web (Next.js), mobile (React Native/Expo), and server (Fastify API).

## Features

- 🌐 **Cross-platform**: Works on web, mobile, and server
- 🔒 **Type-safe**: TypeScript event definitions
- 🎯 **Unified API**: Same interface for both platforms
- 🚀 **Easy integration**: Drop-in providers for React apps
- 🐛 **Error tracking**: Automatic error capture across all platforms
- 👤 **User linking**: Connect events across web, mobile, and server

## Installation

This package is already installed as a workspace dependency.

## Usage

### Web (Next.js)

```tsx
import { PostHogProvider } from "@app/analytics/web";

export default function RootLayout({ children }) {
  return <PostHogProvider>{children}</PostHogProvider>;
}
```

### Mobile (Expo)

```tsx
import { PostHogProvider } from "@app/analytics/mobile";

export default function RootLayout() {
  return <PostHogProvider>{/* Your app */}</PostHogProvider>;
}
```

### Tracking Events

```tsx
import { useAnalytics } from "analytics";

function MyComponent() {
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.track("button_clicked", {
      button_name: "signup",
      location: "home_screen",
    });
  };

  return <Button onPress={handleClick}>Sign Up</Button>;
}
```

### Error Tracking

Wrap your app with ErrorBoundary to catch React errors:

```tsx
import { ErrorBoundary } from "@app/analytics/web"; // or "@app/analytics/mobile"

function App() {
  return (
    <PostHogProvider>
      <ErrorBoundary>{/* Your app content */}</ErrorBoundary>
    </PostHogProvider>
  );
}
```

**See [ERROR_TRACKING.md](./ERROR_TRACKING.md) for complete error tracking documentation.**

## Environment Variables

Add these to your `.env` files:

```bash
# Web (.env.local)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com # or your self-hosted instance

# Mobile (.env)
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## API

### `useAnalytics()`

Hook that returns the analytics instance.

**Methods:**

- `track(event: string, properties?: object)` - Track an event
- `identify(userId: string, properties?: object)` - Identify a user
- `reset()` - Reset the current user
- `capture(event: string, properties?: object)` - Alias for track

### `PostHogProvider`

Provider component that initializes PostHog for your platform.

**Props:**

- `children: ReactNode` - Your app content
