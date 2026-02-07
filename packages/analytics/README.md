# @app/analytics

Cross-platform analytics using PostHog for web (Next.js), mobile (Expo), and server (Fastify/Node).

## Installation

```bash
pnpm add @app/analytics
```

## Features

- **Cross-platform**: Same API for web, mobile, and server
- **Type-safe**: 40+ predefined event types with TypeScript
- **Auto screen/page tracking**: Hooks for Expo Router and Next.js
- **Helper functions**: Use outside React components
- **Feature flags**: Built-in PostHog feature flag support
- **Error tracking**: Automatic capture with ErrorBoundary
- **OTEL logging**: Structured logging for server with OpenTelemetry
- **Event security**: Allowlist and PII scrubbing for client-sent events

## Directory Structure

```
src/
├── index.ts              # Main exports (types only)
├── web.ts                # Web-specific exports
├── mobile.ts             # Mobile-specific exports
├── server.ts             # Server-specific exports
├── types.ts              # Event types & interfaces
├── config/
│   ├── posthog.web.ts    # Web PostHog configuration
│   └── posthog.mobile.ts # Mobile PostHog configuration
├── components/
│   ├── ErrorBoundary.tsx       # Web error boundary
│   └── ErrorBoundary.native.tsx # Mobile error boundary
├── helpers/
│   ├── analytics.web.ts   # Web helper functions
│   └── analytics.mobile.ts # Mobile helper functions
├── hooks/
│   ├── useScreenTracking.web.ts    # Auto page tracking
│   ├── useScreenTracking.mobile.ts # Auto screen tracking
│   ├── useFeatureFlags.mobile.ts   # Mobile feature flags
│   └── usePostHogSurvey.web.ts     # Web surveys
├── providers/
│   ├── PostHogProvider.web.tsx    # Web provider
│   └── PostHogProvider.mobile.tsx # Mobile provider
├── events/
│   ├── allowlist.ts      # Allowed events for client
│   └── scrubber.ts       # PII scrubbing
├── server/
│   ├── index.ts          # Server exports
│   ├── posthog.ts        # PostHog Node client
│   ├── logger.ts         # Structured logger
│   ├── otel-config.ts    # OpenTelemetry setup
│   ├── middleware.ts     # Fastify middleware
│   └── types.ts          # Server types
└── mobile/
    └── logger.ts         # Mobile logger
```

## Quick Start

### Mobile (Expo)

```tsx
import { PostHogProvider, useScreenTracking } from "@app/analytics/mobile";

function RootLayoutNav() {
  useScreenTracking(); // Auto-track screens
  return <Slot />;
}

export default function RootLayout() {
  return (
    <PostHogProvider>
      <RootLayoutNav />
    </PostHogProvider>
  );
}
```

### Web (Next.js)

```tsx
import { PostHogProvider, usePageTracking } from "@app/analytics/web";

function PageTracker() {
  usePageTracking(); // Auto-track pages
  return null;
}

export default function RootLayout({ children }) {
  return (
    <PostHogProvider>
      <PageTracker />
      {children}
    </PostHogProvider>
  );
}
```

### Server (Fastify)

```typescript
import {
  initServerAnalytics,
  trackServerEvent,
  analyticsMiddleware,
  createLogger,
} from "@app/analytics/server";

// Initialize on startup
await initServerAnalytics({ apiKey: process.env.POSTHOG_KEY });

// Add middleware for request tracking
app.addHook("onRequest", analyticsMiddleware);

// Create structured logger
const logger = createLogger({ name: "my-service" });
logger.info("Server started", { port: 3030 });

// Track events with context
trackServerEvent("api_request_completed", {
  endpoint: "/users",
  duration_ms: 45,
  status_code: 200,
});
```

## Environment Variables

```bash
# Mobile (.env)
EXPO_PUBLIC_POSTHOG_KEY=phc_your_key
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Web (.env.local)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Server (.env)
POSTHOG_KEY=phc_your_server_key
POSTHOG_HOST=https://us.i.posthog.com

# OTEL (optional)
OTEL_EXPORTER_OTLP_ENDPOINT=https://otel-collector.example.com
```

## Tracking Events

### In React Components

```tsx
import { useAnalytics } from "@app/analytics/mobile"; // or /web

function SignupButton() {
  const { trackEvent } = useAnalytics();

  const handleSignup = () => {
    trackEvent("signup_started", { method: "email" });
  };

  return <Button onPress={handleSignup}>Sign Up</Button>;
}
```

### Outside React (Helper Functions)

```typescript
// Mobile
import { trackEvent, identifyUser, resetAnalytics } from "@app/analytics/mobile";

// Web
import { trackEvent, identifyUser, resetAnalytics } from "@app/analytics/web";

// After login
identifyUser(user.id, { email: user.email, name: user.name });

// Track events
trackEvent("feature_used", { feature: "dark_mode" });

// On logout
resetAnalytics();
```

### Server-side

```typescript
import { trackServerEvent, identifyServerUser } from "@app/analytics/server";

// With request context
trackServerEventWithContext(context, "subscription_started", {
  plan: "pro",
  price: 9.99,
  currency: "USD",
});

// Identify user
identifyServerUser(userId, {
  email: user.email,
  plan: subscription.plan,
});
```

## Type-Safe Events

All events are defined in `types.ts` with full TypeScript support:

```typescript
import type { AppEvents } from "@app/analytics";

// Type-safe event tracking
trackEvent<keyof AppEvents>("login_completed", {
  user_id: "123",
  method: "email", // Must be: "email" | "google" | "apple" | "github"
});
```

### Available Event Categories

| Category           | Events                                                                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **App Lifecycle**  | `app_opened`, `app_backgrounded`, `app_foregrounded`                                                                                                                                          |
| **Screen/Page**    | `screen_viewed`                                                                                                                                                                               |
| **Authentication** | `signup_started`, `signup_completed`, `signup_failed`, `login_started`, `login_completed`, `login_failed`, `logout`, `password_reset_requested`, `password_reset_completed`, `email_verified` |
| **Subscription**   | `paywall_viewed`, `subscription_started`, `subscription_renewed`, `subscription_cancelled`, `subscription_expired`, `restore_purchases_*`                                                     |
| **Revenue**        | `purchase`                                                                                                                                                                                    |
| **Feature Usage**  | `feature_used`, `button_clicked`                                                                                                                                                              |
| **User Actions**   | `language_changed`, `theme_changed`, `notification_*`                                                                                                                                         |
| **Errors**         | `error_occurred`, `api_error`                                                                                                                                                                 |
| **Group/Tenant**   | `group_created`, `group_joined`, `group_left`, `invite_sent`, `invite_accepted`                                                                                                               |
| **Performance**    | `app_cold_start`, `api_request_completed`                                                                                                                                                     |

## Feature Flags

### In React Components

```tsx
// Mobile
import { useFeatureFlag, useFeatureFlagEnabled } from "@app/analytics/mobile";

// Web
import { useFeatureFlagEnabled, useFeatureFlagPayload } from "@app/analytics/web";

function MyComponent() {
  const isEnabled = useFeatureFlagEnabled("new-feature");
  const variant = useFeatureFlagPayload("experiment-variant");

  if (!isEnabled) return null;
  return <NewFeature variant={variant} />;
}
```

### Outside React

```typescript
import { isFeatureEnabled, getFeatureFlagPayload } from "@app/analytics/mobile";

if (isFeatureEnabled("premium-feature")) {
  // Show premium content
}
```

### Server-side

```typescript
import { isFeatureFlagEnabled, getFeatureFlag } from "@app/analytics/server";

const isEnabled = await isFeatureFlagEnabled("new-api", userId);
const variant = await getFeatureFlag("experiment", userId);
```

## Error Tracking

### ErrorBoundary Component

```tsx
import { ErrorBoundary } from "@app/analytics/mobile"; // or /web

function App() {
  return (
    <ErrorBoundary fallback={<ErrorScreen />}>
      <MainApp />
    </ErrorBoundary>
  );
}
```

### Manual Error Tracking

```typescript
import { trackError } from "@app/analytics/mobile";

try {
  await riskyOperation();
} catch (error) {
  trackError(error as Error, { context: "payment_flow" });
}
```

## Server Logging (OTEL)

Structured logging with OpenTelemetry for observability:

```typescript
import { createLogger, initOtelLogging } from "@app/analytics/server";

// Initialize OTEL (once at startup)
await initOtelLogging({
  endpoint: process.env.OTEL_ENDPOINT,
  serviceName: "api",
  serviceVersion: "1.0.0",
});

// Create logger
const logger = createLogger({ name: "payment-service" });

// Log with context
logger.info("Payment processed", {
  amount: 99.99,
  currency: "USD",
  userId,
});

logger.error("Payment failed", {
  error: error.message,
  paymentId,
});
```

## Event Security

### Allowlist

Only predefined events can be sent from clients:

```typescript
import { isAllowedEvent, ALLOWED_EVENTS } from "@app/analytics/server";

// Validate client-sent events
if (!isAllowedEvent(eventName)) {
  throw new Error("Event not allowed");
}
```

### PII Scrubbing

Automatically removes sensitive data:

```typescript
import { scrubEvent } from "@app/analytics/server";

const result = scrubEvent(eventName, properties);
if (result.ok) {
  // Use result.data (scrubbed properties)
} else {
  // Handle result.errors
}
```

## Exports Reference

### `@app/analytics` (Main)

```typescript
export type { AppEvents, AnalyticsProperties, AnalyticsUser, Analytics };
```

### `@app/analytics/web`

```typescript
// Providers
export { PostHogProvider, useAnalytics };

// Page Tracking
export { usePageTracking, useTrackPage };

// Helper Functions
export {
  trackEvent,
  identifyUser,
  resetAnalytics,
  trackFeatureUsed,
  trackError,
  trackRevenue,
  trackSubscription,
  setUserProperties,
  trackPageView,
  isFeatureEnabled,
  getFeatureFlagPayload,
  optOut,
  optIn,
  hasOptedOut,
};

// Feature Flags (from posthog-js)
export {
  usePostHog,
  useFeatureFlagEnabled,
  useFeatureFlagPayload,
  useFeatureFlagVariantKey,
  useActiveFeatureFlags,
  PostHogFeature,
};

// Components
export { ErrorBoundary };
```

### `@app/analytics/mobile`

```typescript
// Providers
export { PostHogProvider, useAnalytics };

// Screen Tracking
export { useScreenTracking, useTrackScreen };

// Helper Functions
export {
  trackEvent,
  identifyUser,
  resetAnalytics,
  trackFeatureUsed,
  trackError,
  trackRevenue,
  trackSubscription,
  setUserProperties,
  trackScreen,
  flushEvents,
  isFeatureEnabled,
  getFeatureFlagPayload,
  reloadFeatureFlags,
  getPostHogClient,
  getSessionId,
};

// Feature Flags (from posthog-react-native)
export {
  usePostHog,
  useFeatureFlag,
  useFeatureFlags,
  useFeatureFlagEnabled,
  useFeatureFlagPayload,
  useFeatureFlagVariantKey,
  PostHogSurveyProvider,
};

// Components
export { ErrorBoundary };

// Logging
export { logger, createMobileLogger };
```

### `@app/analytics/server`

```typescript
// Core PostHog
export {
  initServerAnalytics,
  trackServerEvent,
  trackServerEventWithContext,
  identifyServerUser,
  captureServerError,
  shutdownAnalytics,
  flushServerEvents,
  // Feature flags
  isFeatureFlagEnabled,
  getFeatureFlag,
  getFeatureFlagPayload,
  getAllFeatureFlags,
  reloadFeatureFlags,
};

// OTEL Logging
export { initOtelLogging, getLoggerProvider, shutdownOtelLogging, flushOtelLogs };

// Logger
export { createLogger, createRequestLogger };

// Middleware
export {
  analyticsMiddleware,
  extractAnalyticsContext,
  getRequestContext,
  TRACE_ID_HEADER,
  DISTINCT_ID_HEADER,
  SESSION_ID_HEADER,
};

// Event Security
export { ALLOWED_EVENTS, isAllowedEvent, getEventSchema, scrubEvent, eventRequiresAuth };
```

## UI Abstraction Layer

For shared screens that work on both web and mobile, use `@app/ui/analytics`:

```tsx
// In shared screen (packages/ui)
import { useAnalytics } from "@app/ui/analytics";

function SharedScreen() {
  const { track, identify, reset } = useAnalytics();
  // Platform-agnostic analytics
}
```

Platform-specific providers are set up in apps:

- Web: `@app/ui/analytics-web`
- Mobile: `@app/ui/analytics-native`

## Architecture

```
apps/api
  └── Uses @app/analytics/server for backend tracking

apps/web
  └── Uses @app/analytics/web + @app/ui/analytics-web provider

apps/mobile
  └── Uses @app/analytics/mobile + @app/ui/analytics-native provider

packages/ui
  └── Uses @app/ui/analytics (platform-agnostic abstraction)
```

**Dependency flow:**

- `@app/analytics` → PostHog libraries
- `@app/ui` → `@app/analytics` (for types and abstraction)
- Apps → Platform-specific analytics exports

## Related Packages

| Package       | Purpose                                        |
| ------------- | ---------------------------------------------- |
| `@app/ui`     | Analytics abstraction layer for shared screens |
| `@app/config` | Feature flag configuration                     |

## Documentation

See [docs/guides/ANALYTICS.md](../../docs/guides/ANALYTICS.md) for complete documentation including:

- PostHog dashboard setup
- Custom event creation
- A/B testing with feature flags
- Privacy and GDPR compliance
