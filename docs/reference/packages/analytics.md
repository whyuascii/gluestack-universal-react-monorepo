# Analytics Package

PostHog analytics and error tracking integration for web, mobile, and API.

## Overview

The `analytics` package provides a unified interface for event tracking, user identification, and error monitoring across all platforms using PostHog.

**Package:** `packages/analytics`

**Platform Support:**

- ✅ Web (Next.js) - `@app/analytics/web`
- ✅ Mobile (React Native) - `@app/analytics/mobile`
- ✅ API (Node.js) - Used directly in API server

---

## Installation

Already included in the monorepo. Apps import platform-specific modules:

```typescript
// Web
import { analytics } from "@app/analytics/web";
import { ErrorBoundary } from "@app/analytics/web";

// Mobile
import { analytics } from "@app/analytics/mobile";
import { ErrorBoundary } from @app/"analytics/mobile";
```

---

## Configuration

### Environment Variables

**Web** (`apps/web/.env.local`):

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**Mobile** (`apps/mobile/.env`):

```bash
EXPO_PUBLIC_POSTHOG_KEY=phc_your_project_key
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**API** (`apps/api/.env`):

```bash
POSTHOG_KEY=phc_your_project_key
POSTHOG_HOST=https://us.i.posthog.com
```

---

## Exports

### analytics

Main analytics instance for tracking events.

#### Methods

##### `track(event: string, properties?: Record<string, any>)`

Track a custom event.

**Parameters:**

- `event` (string) - Event name (e.g., "button_clicked", "page_viewed")
- `properties` (object, optional) - Event metadata

**Example:**

```typescript
analytics.track("button_clicked", {
  button_id: "signup",
  page: "landing",
  user_plan: "free",
});
```

##### `identify(userId: string, properties?: Record<string, any>)`

Identify a user and set user properties.

**Parameters:**

- `userId` (string) - Unique user identifier
- `properties` (object, optional) - User attributes

**Example:**

```typescript
analytics.identify(user.id, {
  email: user.email,
  name: user.name,
  plan: "premium",
  created_at: user.createdAt,
});
```

##### `reset()`

Clear user identification (call on logout).

**Example:**

```typescript
// On user logout
analytics.reset();
```

##### `capture(event: string, properties?: Record<string, any>)`

Alias for `track()`. Available for PostHog compatibility.

**Example:**

```typescript
analytics.capture("purchase_completed", {
  product_id: "prod_123",
  amount: 99.99,
  currency: "USD",
});
```

---

### ErrorBoundary

React component for catching and reporting errors.

**Props:**

- `children` (ReactNode) - Components to wrap
- `fallback` (ReactNode | Function) - Error UI to display
- `onError` (Function, optional) - Callback when error occurs

**Example:**

```typescript
import { ErrorBoundary } from "@app/analytics/web";

function App() {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo) => (
        <div>
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
        </div>
      )}
      onError={(error, errorInfo) => {
        console.error("Error caught:", error);
        // Additional error handling
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

**Without custom fallback:**

```typescript
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

---

## Platform Differences

### Web (PostHog JS)

**Location:** `packages/analytics/src/config/posthog.web.ts`

**Features:**

- Session recording
- Heatmaps
- Feature flags
- A/B testing
- Autocapture (automatic event tracking)

**Initialization:**

```typescript
import { PostHogProvider } from "@app/analytics/web";

// In app root
<PostHogProvider>
  <App />
</PostHogProvider>
```

### Mobile (PostHog React Native)

**Location:** `packages/analytics/src/config/posthog.mobile.ts`

**Features:**

- Event tracking
- User identification
- Session replay (optional)
- Feature flags
- A/B testing

**Initialization:**

```typescript
import { PostHogProvider } from "analytics/mobile";

// In app root
<PostHogProvider>
  <App />
</PostHogProvider>
```

### API (PostHog Node)

**Location:** `apps/api/src/plugins/posthog-analytics.ts`

**Features:**

- Server-side event tracking
- User identification
- Feature flags

**Usage:**

```typescript
// In API routes
import { posthog } from "../plugins/posthog-analytics";

posthog.capture({
  distinctId: userId,
  event: "api_request",
  properties: {
    endpoint: "/api/v1/users",
    method: "POST",
    status: 200,
  },
});
```

---

## Common Use Cases

### Track Page Views

**Web:**

```typescript
// Automatic with PostHog autocapture
// Or manual:
analytics.track("$pageview", {
  path: window.location.pathname,
});
```

**Mobile:**

```typescript
import { useEffect } from "react";
import { usePathname } from "expo-router";

function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    analytics.track("$screen_view", {
      screen: pathname,
    });
  }, [pathname]);
}
```

### Track User Actions

```typescript
// Button click
<button
  onClick={() => {
    analytics.track("cta_clicked", {
      cta_type: "signup",
      location: "hero",
    });
  }}
>
  Sign Up
</button>

// Form submission
const handleSubmit = (data) => {
  analytics.track("form_submitted", {
    form_name: "contact",
    fields: Object.keys(data),
  });
};
```

### Identify Users on Login

```typescript
const handleLogin = async (credentials) => {
  const user = await signIn(credentials);

  // Identify user
  analytics.identify(user.id, {
    email: user.email,
    name: user.name,
    plan: user.subscriptionPlan,
    signed_up_at: user.createdAt,
  });
};
```

### Reset on Logout

```typescript
const handleLogout = async () => {
  await signOut();

  // Clear user identification
  analytics.reset();
};
```

### Track Errors

**Automatic (with ErrorBoundary):**

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Manual:**

```typescript
try {
  await riskyOperation();
} catch (error) {
  analytics.track("error_occurred", {
    error_message: error.message,
    error_stack: error.stack,
    context: "payment_processing",
  });

  throw error; // Re-throw if needed
}
```

### Feature Flags

```typescript
import { usePostHog } from "posthog-js/react";

function FeatureComponent() {
  const posthog = usePostHog();
  const showNewFeature = posthog.isFeatureEnabled("new-dashboard");

  return showNewFeature ? <NewDashboard /> : <OldDashboard />;
}
```

---

## Best Practices

### Event Naming

**DO:**

- ✅ Use snake_case: `button_clicked`, `form_submitted`
- ✅ Use past tense: `user_signed_up`, `payment_completed`
- ✅ Be specific: `checkout_completed` not `action_taken`

**DON'T:**

- ❌ Mix cases: `buttonClicked`, `Button-Clicked`
- ❌ Use present tense: `user_signs_up`
- ❌ Be vague: `event_1`, `thing_happened`

### Property Naming

**DO:**

- ✅ Use consistent casing (snake_case recommended)
- ✅ Include context: `button_id`, `page_location`
- ✅ Use meaningful values: `plan: "premium"` not `plan: 1`

**DON'T:**

- ❌ Include PII in events: ❌ `user_email`, ❌ `credit_card`
- ❌ Use inconsistent naming: `userId` vs `user_id`

### Privacy

**Never track:**

- ❌ Passwords
- ❌ Credit card numbers
- ❌ Social security numbers
- ❌ Health information

**Be careful with:**

- Email addresses (use hashed user ID instead when possible)
- IP addresses (PostHog handles automatically)
- Device identifiers

### Performance

**DO:**

- ✅ Track important user actions
- ✅ Batch similar events when possible
- ✅ Keep property objects small (<10 properties)

**DON'T:**

- ❌ Track every click/mouse movement
- ❌ Send large objects (>1KB) in properties
- ❌ Track PII or sensitive data

---

## Error Handling

### Unhandled Errors

PostHog automatically captures:

- Unhandled promise rejections
- Uncaught exceptions
- React component errors (with ErrorBoundary)

### Custom Error Reporting

```typescript
// Report specific errors
const reportError = (error: Error, context?: Record<string, any>) => {
  analytics.track("error", {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

// Usage
try {
  await fetchData();
} catch (error) {
  reportError(error, {
    component: "DataFetcher",
    user_id: currentUser.id,
  });
}
```

---

## Debugging

### Check Events in PostHog

1. Go to PostHog dashboard
2. Navigate to Events → Live Events
3. See events as they arrive in real-time

### Console Logging

```typescript
// Enable debug mode
analytics.debug(true);

// All events will be logged to console
analytics.track("test_event"); // Logs to console
```

### Test Mode

```typescript
// Disable sending events in development
if (process.env.NODE_ENV === "development") {
  // Events are logged but not sent
  analytics.opt_out_capturing();
}
```

---

## Related Documentation

- **[Analytics Guide](../../guides/features/analytics.md)** - Setup and implementation
- **[Error Tracking Guide](../../guides/features/error-tracking.md)** - Error monitoring
- **[PostHog Docs](https://posthog.com/docs)** - Official PostHog documentation
