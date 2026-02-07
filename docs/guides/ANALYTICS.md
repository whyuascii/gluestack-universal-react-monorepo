# Analytics Guide

Complete guide for integrating PostHog analytics in this cross-platform monorepo.

**Platforms:** Web (Next.js), Mobile (Expo/React Native)

---

## Quick Start

### Mobile (Expo)

```tsx
// In apps/mobile/src/app/_layout.tsx
import { PostHogProvider, useScreenTracking } from "@app/analytics/mobile";

function RootLayoutNav() {
  // Enable automatic screen tracking for Expo Router
  useScreenTracking();
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
// In apps/web/src/app/layout.tsx
import { PostHogProvider, usePageTracking } from "@app/analytics/web";

function PageTracker() {
  usePageTracking();
  return null;
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PostHogProvider>
          <PageTracker />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
```

---

## Environment Variables

### Mobile (.env)

```env
EXPO_PUBLIC_POSTHOG_KEY=phc_your_api_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Web (.env.local)

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**PostHog Hosts:**

- US Cloud: `https://us.i.posthog.com`
- EU Cloud: `https://eu.i.posthog.com`
- Self-hosted: Your instance URL

---

## Package Structure

```
packages/analytics/
├── src/
│   ├── mobile.ts                          # Mobile exports
│   ├── web.ts                             # Web exports
│   ├── types.ts                           # Type definitions
│   ├── providers/
│   │   ├── PostHogProvider.mobile.tsx     # Mobile provider
│   │   └── PostHogProvider.web.tsx        # Web provider
│   ├── hooks/
│   │   ├── useScreenTracking.mobile.ts    # Expo Router tracking
│   │   └── useScreenTracking.web.ts       # Next.js tracking
│   ├── helpers/
│   │   ├── analytics.mobile.ts            # Mobile helper functions
│   │   └── analytics.web.ts               # Web helper functions
│   ├── config/
│   │   ├── posthog.mobile.ts              # Mobile PostHog config
│   │   └── posthog.web.ts                 # Web PostHog config
│   └── components/
│       ├── ErrorBoundary.tsx              # Web error boundary
│       └── ErrorBoundary.native.tsx       # Mobile error boundary
└── package.json
```

---

## Usage

### Track Custom Events (React Components)

```tsx
// Mobile
import { useAnalytics } from "@app/analytics/mobile";

// Web
import { useAnalytics } from "@app/analytics/web";

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleButtonPress = () => {
    trackEvent("button_clicked", {
      button_name: "subscribe",
      location: "paywall",
    });
  };

  return <Button onPress={handleButtonPress}>Subscribe</Button>;
}
```

### Track Events Outside React

```tsx
// Mobile
import { trackEvent, identifyUser, resetAnalytics } from "@app/analytics/mobile";

// Web
import { trackEvent, identifyUser, resetAnalytics } from "@app/analytics/web";

// After login
identifyUser(user.id, {
  email: user.email,
  name: user.name,
  subscription_tier: "premium",
});

// Track any event
trackEvent("feature_used", {
  feature: "dark_mode",
  enabled: true,
});

// On logout
resetAnalytics();
```

### Track Errors

```tsx
import { trackError } from "@app/analytics/mobile"; // or /web

try {
  await riskyOperation();
} catch (error) {
  trackError("api_error", error, {
    endpoint: "/api/users",
    action: "fetch_profile",
  });
}
```

### Track Revenue (Subscriptions)

```tsx
import { trackRevenue, trackSubscription } from "@app/analytics/mobile";

// After successful purchase
trackRevenue(4.99, "USD", "premium_monthly", {
  source: "paywall",
  trial_converted: true,
});

// Or use subscription helper
trackSubscription("started", {
  plan: "monthly",
  price: 4.99,
  currency: "USD",
  trial_used: true,
});
```

### Feature Flags (React Hooks)

```tsx
// Web - React hooks for feature flags
import {
  useFeatureFlagEnabled,
  useFeatureFlagVariantKey,
  useFeatureFlagPayload,
  PostHogFeature,
} from "@app/analytics/web";

function MyComponent() {
  // Check if flag is enabled
  const isEnabled = useFeatureFlagEnabled("new-feature");

  // Get variant for A/B tests
  const variant = useFeatureFlagVariantKey("experiment-key");

  // Get JSON payload
  const config = useFeatureFlagPayload("feature-config");

  if (variant === "test") {
    return <TestVariant />;
  }
  return <ControlVariant />;
}

// Or use PostHogFeature component (auto-tracks exposure)
<PostHogFeature flag="new-feature" match={true}>
  <NewFeature />
</PostHogFeature>;
```

```tsx
// Mobile - React hooks for feature flags
import {
  useFeatureFlagEnabled,
  useFeatureFlagVariantKey,
  useFeatureFlagPayload,
  useFeatureFlag,
} from "@app/analytics/mobile";

function MyScreen() {
  const isEnabled = useFeatureFlagEnabled("new-onboarding");
  const variant = useFeatureFlagVariantKey("onboarding-experiment");

  return isEnabled ? <NewOnboarding variant={variant} /> : <OldOnboarding />;
}
```

### Feature Flags (Outside React)

```tsx
// Mobile
import { isFeatureEnabled, getFeatureFlagPayload } from "@app/analytics/mobile";

// Web
import { isFeatureEnabled, getFeatureFlagPayload } from "@app/analytics/web";

// Check if feature is enabled
const showNewUI = await isFeatureEnabled("new-dashboard-ui");

// Get feature flag payload
const config = getFeatureFlagPayload("experiment-config");
```

### Feature Flags (Server-Side)

```typescript
import {
  isFeatureFlagEnabled,
  getFeatureFlag,
  getFeatureFlagPayload,
  getAllFeatureFlags,
} from "@app/analytics/server";

// Check boolean flag
const betaEnabled = await isFeatureFlagEnabled("beta-features", userId);

// Get variant for experiments
const variant = await getFeatureFlag("pricing-experiment", userId);

// Get JSON payload
const config = await getFeatureFlagPayload("feature-config", userId);

// Get all flags (for bootstrapping client)
const allFlags = await getAllFeatureFlags(userId);
```

---

## A/B Tests (Experiments)

Experiments use multivariate feature flags to test different variants.

### Setting Up an Experiment

1. **Create experiment in PostHog** (Experiments tab → New experiment)
2. **Implement variant logic**:

```tsx
import { useFeatureFlagVariantKey, useFeatureFlagPayload } from "@app/analytics/web";

function CheckoutButton() {
  // Get assigned variant
  const variant = useFeatureFlagVariantKey("checkout-experiment");

  // IMPORTANT: Use payload hook to ensure exposure tracking
  const payload = useFeatureFlagPayload("checkout-experiment");

  switch (variant) {
    case "test-a":
      return <CheckoutButtonA />;
    case "test-b":
      return <CheckoutButtonB />;
    default:
      return <CheckoutButtonControl />;
  }
}
```

3. **Track conversion events**:

```typescript
import { trackEvent } from "@app/analytics/web";

// Track the goal event
trackEvent("checkout_completed", {
  value: orderTotal,
  variant: variant,
});
```

### Server-Side A/B Tests

```typescript
import { getFeatureFlag } from "@app/analytics/server";

const variant = await getFeatureFlag("pricing-experiment", userId);

if (variant === "discounted") {
  return { price: originalPrice * 0.9 };
}
return { price: originalPrice };
```

---

## Surveys

### Web Surveys

Popover surveys display automatically when conditions match. For custom survey UIs:

```tsx
import { usePostHogSurvey } from "@app/analytics/web";

function SurveyComponent() {
  const { surveys, activeSurvey, captureSurveyResponse, captureSurveyDismissed } =
    usePostHogSurvey();

  if (!activeSurvey) return null;

  const handleSubmit = (response: Record<string, unknown>) => {
    captureSurveyResponse(activeSurvey.id, response);
  };

  return (
    <CustomSurvey
      survey={activeSurvey}
      onSubmit={handleSubmit}
      onDismiss={() => captureSurveyDismissed(activeSurvey.id)}
    />
  );
}
```

### Mobile Surveys

```tsx
// Add PostHogSurveyProvider to your app root
import { PostHogSurveyProvider } from "@app/analytics/mobile";

function RootLayout() {
  return (
    <PostHogProvider>
      <PostHogSurveyProvider>
        <App />
      </PostHogSurveyProvider>
    </PostHogProvider>
  );
}
```

Popover surveys display automatically when conditions match.

---

## Available Functions

### Mobile (`@app/analytics/mobile`)

| Function                   | Description                     |
| -------------------------- | ------------------------------- |
| `PostHogProvider`          | React provider component        |
| `useAnalytics`             | Hook for tracking in components |
| `useScreenTracking`        | Auto-track Expo Router screens  |
| `useTrackScreen`           | Manually track a screen         |
| `trackEvent`               | Track event outside React       |
| `identifyUser`             | Identify a user                 |
| `resetAnalytics`           | Reset on logout                 |
| `trackError`               | Track errors                    |
| `trackRevenue`             | Track purchases                 |
| `trackSubscription`        | Track subscription events       |
| `trackFeatureUsed`         | Track feature usage             |
| `trackScreen`              | Track screen views              |
| `setUserProperties`        | Set user properties             |
| `flushEvents`              | Flush pending events            |
| `isFeatureEnabled`         | Check feature flag (async)      |
| `getFeatureFlagPayload`    | Get flag payload                |
| `reloadFeatureFlags`       | Reload flags                    |
| `getPostHogClient`         | Get raw PostHog client          |
| `usePostHog`               | Hook for PostHog client         |
| `useFeatureFlag`           | Hook for raw flag value         |
| `useFeatureFlags`          | Hook for all flags              |
| `useFeatureFlagEnabled`    | Hook for boolean flag check     |
| `useFeatureFlagVariantKey` | Hook for experiment variant     |
| `useFeatureFlagPayload`    | Hook for flag JSON payload      |
| `PostHogSurveyProvider`    | Provider for mobile surveys     |

### Web (`@app/analytics/web`)

| Function                   | Description                     |
| -------------------------- | ------------------------------- |
| `PostHogProvider`          | React provider component        |
| `useAnalytics`             | Hook for tracking in components |
| `usePageTracking`          | Auto-track Next.js pages        |
| `useTrackPage`             | Manually track a page           |
| `trackEvent`               | Track event outside React       |
| `identifyUser`             | Identify a user                 |
| `resetAnalytics`           | Reset on logout                 |
| `trackError`               | Track errors                    |
| `trackRevenue`             | Track purchases                 |
| `trackSubscription`        | Track subscription events       |
| `trackFeatureUsed`         | Track feature usage             |
| `trackPageView`            | Track page views                |
| `setUserProperties`        | Set user properties             |
| `isFeatureEnabled`         | Check feature flag (sync)       |
| `getFeatureFlagPayload`    | Get flag payload                |
| `reloadFeatureFlags`       | Reload flags                    |
| `registerSuperProperties`  | Register global properties      |
| `unregisterSuperProperty`  | Remove global property          |
| `getDistinctId`            | Get current distinct ID         |
| `optOut`                   | Opt user out of tracking        |
| `optIn`                    | Opt user back in                |
| `hasOptedOut`              | Check opt-out status            |
| `usePostHog`               | Hook for PostHog client         |
| `useFeatureFlagEnabled`    | Hook for boolean flag check     |
| `useFeatureFlagVariantKey` | Hook for experiment variant     |
| `useFeatureFlagPayload`    | Hook for flag JSON payload      |
| `useActiveFeatureFlags`    | Hook for all active flags       |
| `PostHogFeature`           | Component for feature-gated UI  |
| `usePostHogSurvey`         | Hook for custom survey UIs      |

### Server (`@app/analytics/server`)

| Function                | Description                    |
| ----------------------- | ------------------------------ |
| `initServerAnalytics`   | Initialize server-side PostHog |
| `trackServerEvent`      | Track event server-side        |
| `identifyServerUser`    | Identify user server-side      |
| `captureServerError`    | Capture error/exception        |
| `shutdownAnalytics`     | Shutdown PostHog client        |
| `flushServerEvents`     | Flush pending events           |
| `isFeatureFlagEnabled`  | Check boolean flag (async)     |
| `getFeatureFlag`        | Get flag value/variant (async) |
| `getFeatureFlagPayload` | Get flag JSON payload (async)  |
| `getAllFeatureFlags`    | Get all flags for user (async) |
| `reloadFeatureFlags`    | Reload flag definitions        |

---

## Predefined Event Types

The package includes type definitions for common events:

### App Lifecycle

- `app_opened` - App launched
- `app_backgrounded` - App went to background
- `app_foregrounded` - App came to foreground

### Authentication

- `signup_started`, `signup_completed`, `signup_failed`
- `login_started`, `login_completed`, `login_failed`
- `logout`
- `password_reset_requested`, `password_reset_completed`
- `email_verified`

### Subscriptions

- `paywall_viewed`
- `subscription_started`, `subscription_renewed`, `subscription_cancelled`, `subscription_expired`
- `restore_purchases_started`, `restore_purchases_completed`, `restore_purchases_failed`
- `purchase`

### Feature Usage

- `feature_used`
- `button_clicked`

### User Actions

- `language_changed`
- `theme_changed`
- `notification_permission_requested`
- `notification_received`, `notification_opened`

### Errors

- `error_occurred`
- `api_error`

### Groups/Tenants

- `group_created`, `group_joined`, `group_left`
- `invite_sent`, `invite_accepted`

See `packages/analytics/src/types.ts` for full type definitions.

---

## Best Practices

### 1. Always Identify Users After Auth

```tsx
// After successful login
identifyUser(user.id, {
  email: user.email,
  name: user.name,
  created_at: user.createdAt,
});
```

### 2. Reset on Logout

```tsx
// When user logs out
resetAnalytics();
```

### 3. Track Meaningful Events

Focus on events that help understand user behavior:

- Feature usage (what do users actually use?)
- Conversion events (paywall views, subscription starts)
- Errors (what's breaking?)

### 4. Use Properties Wisely

Add context to events:

```tsx
trackEvent("subscription_started", {
  plan: "monthly",
  price: 4.99,
  source: "paywall", // Where did they convert?
  trial_used: true, // Did they use a trial?
  days_since_install: 7, // How long before converting?
});
```

### 5. Handle Privacy (Web)

```tsx
import { optOut, optIn, hasOptedOut } from "@app/analytics/web";

// Check user preference
if (userPrefersDNT) {
  optOut();
}

// Allow user to opt back in
if (userConsented) {
  optIn();
}
```

### 6. Flush on Important Actions (Mobile)

```tsx
import { flushEvents } from "@app/analytics/mobile";

// After critical events, ensure they're sent
trackEvent("purchase_completed", { ... });
flushEvents();
```

---

## PostHog Dashboard Setup

### Recommended Actions to Create

| Action Name   | Event              | Description             |
| ------------- | ------------------ | ----------------------- |
| App Opened    | `app_opened`       | User opens the app      |
| Screen Viewed | `$screen`          | User views a screen     |
| Page Viewed   | `$pageview`        | User views a page (web) |
| Signup        | `signup_completed` | User signs up           |
| Login         | `login_completed`  | User logs in            |
| Feature Used  | `feature_used`     | User uses a feature     |
| Purchase      | `purchase`         | User makes a purchase   |
| Error         | `error_occurred`   | An error occurred       |

### Recommended Dashboards

1. **User Engagement**
   - Daily/Weekly/Monthly active users
   - Session duration
   - Screens/pages per session

2. **Conversion Funnel**
   - App opened → Paywall viewed → Subscription started

3. **Feature Adoption**
   - Most used features
   - Feature usage by user segment

4. **Revenue**
   - MRR tracking
   - Subscription conversions
   - Trial to paid conversion rate

5. **Errors**
   - Error rate over time
   - Most common error types
   - Errors by user segment

---

## Troubleshooting

### Events Not Appearing

1. Check API key is correct
2. Check host URL matches your PostHog region
3. Mobile: Call `flushEvents()` to force send
4. Check network connectivity
5. Check console for errors

### Screen/Page Tracking Not Working

1. Ensure tracking hook is called inside provider
2. Mobile: Check `captureScreens: false` in provider config
3. Web: Ensure `usePageTracking` is called in a client component

### User Not Identified

1. Ensure `identifyUser()` is called after PostHog initializes
2. Check that user ID is a string

### Mobile: High Battery Usage

1. Increase `flushInterval` in config
2. Disable `enableSessionReplay` if not needed

---

## Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog React Native SDK](https://posthog.com/docs/libraries/react-native)
- [PostHog JavaScript SDK](https://posthog.com/docs/libraries/js)
- [PostHog Node.js SDK](https://posthog.com/docs/libraries/node)
- [PostHog Feature Flags](https://posthog.com/docs/feature-flags)
- [PostHog Experiments](https://posthog.com/docs/experiments)
- [PostHog Surveys](https://posthog.com/docs/surveys)
- [PostHog Session Recording](https://posthog.com/docs/session-replay)
