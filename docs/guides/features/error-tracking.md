# Error Tracking with PostHog

Complete error tracking across web, mobile, and server using PostHog's error tracking feature.

## Overview

PostHog error tracking is enabled across all platforms:

- ✅ **Web (Next.js)**: Automatic unhandled errors + React ErrorBoundary
- ✅ **Mobile (React Native)**: Global error handlers + React ErrorBoundary
- ✅ **Server (Fastify API)**: Automatic error capture + manual exception tracking

All errors are sent to PostHog with the `$exception` event and include:

- Error type and message
- Stack trace
- User context (distinct_id, user_id)
- Additional metadata

## Web Error Tracking

### Automatic Error Tracking

Unhandled errors and promise rejections are automatically captured:

```typescript
// apps/web/src/app/layout.tsx
import { PostHogProvider } from "@app/analytics/web";

export default function RootLayout({ children }) {
  return (
    <PostHogProvider>
      {/* Unhandled errors are automatically captured */}
      {children}
    </PostHogProvider>
  );
}
```

### React ErrorBoundary

Wrap your app or specific components with ErrorBoundary to catch React errors:

```typescript
import { ErrorBoundary } from "@app/analytics/web";

export default function RootLayout({ children }) {
  return (
    <PostHogProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </PostHogProvider>
  );
}
```

**Custom fallback UI:**

```typescript
<ErrorBoundary
  fallback={(error, errorInfo) => (
    <div>
      <h1>Oops! Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  )}
  onError={(error, errorInfo) => {
    // Custom error handling logic
    console.log("Error caught:", error);
  }}
>
  {children}
</ErrorBoundary>
```

### Manual Error Capture

```typescript
import { useAnalytics } from "@app/analytics/web";
import posthog from "posthog-js";

function MyComponent() {
  const analytics = useAnalytics();

  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      // Manual error capture
      posthog.capture("$exception", {
        $exception_type: error.name,
        $exception_message: error.message,
        $exception_stack_trace: error.stack,
        $exception_source: "manual-catch",
        action: "risky_operation",
      });
    }
  };
}
```

## Mobile Error Tracking

### Automatic Error Tracking

Global error handlers automatically capture unhandled errors:

```typescript
// apps/mobile/src/app/_layout.tsx
import { PostHogProvider } from "analytics/mobile";

export default function RootLayout() {
  return (
    <PostHogProvider>
      {/* Unhandled errors are automatically captured */}
      <App />
    </PostHogProvider>
  );
}
```

### React ErrorBoundary

Use ErrorBoundary for React Native:

```typescript
import { ErrorBoundary } from "analytics/mobile";

export default function RootLayout() {
  return (
    <PostHogProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </PostHogProvider>
  );
}
```

**Custom fallback UI:**

```typescript
import { View, Text, Button } from "react-native";

<ErrorBoundary
  fallback={(error, errorInfo) => (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>
        Something went wrong
      </Text>
      <Text>{error.message}</Text>
      <Button title="Restart" onPress={() => {/* restart logic */}} />
    </View>
  )}
>
  {children}
</ErrorBoundary>
```

### Manual Error Capture

```typescript
import { analytics } from "analytics/mobile";

const handleAction = async () => {
  try {
    await riskyOperation();
  } catch (error) {
    const client = analytics.getClient();
    if (client) {
      client.capture("$exception", {
        $exception_type: error.name,
        $exception_message: error.message,
        $exception_stack_trace: error.stack,
        $exception_source: "manual-catch",
        screen: "ProfileScreen",
      });
    }
  }
};
```

## Server Error Tracking

### Automatic Error Tracking

All Fastify errors are automatically captured:

```typescript
// apps/api/src/index.ts
import fastify from "fastify";
import posthogErrorHandler from "./plugins/posthog-error-handler";

const app = fastify();

await app.register(posthogErrorHandler); // Register last!

// All errors thrown in routes are automatically captured
app.get("/api/test", async () => {
  throw new Error("This error will be captured!");
});
```

### Manual Error Capture

```typescript
import { captureException } from "./lib/posthog-server";

app.get("/api/data", async (request, reply) => {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    // Capture with user context
    captureException(error, {
      userId: request.user?.id,
      properties: {
        endpoint: "/api/data",
        method: request.method,
        query: request.query,
      },
    });

    throw error; // Will also be caught by error handler
  }
});
```

## Error Event Properties

All errors include these standard PostHog properties:

```typescript
{
  event: "$exception",
  properties: {
    // Required
    $exception_type: "Error",          // Error class name
    $exception_message: "...",         // Error message
    $exception_stack_trace: "...",     // Stack trace

    // Optional platform-specific
    $exception_component_stack: "...", // React component stack (web/mobile)
    $exception_is_fatal: true,         // Fatal error flag (mobile)
    $exception_source: "...",          // Source of capture

    // Custom properties
    ...customProperties
  }
}
```

## Viewing Errors in PostHog

1. Go to **PostHog Dashboard** → **Error Tracking**
2. Filter by:
   - Platform (web/mobile/server)
   - User
   - Time range
   - Error type
3. Click on an error to see:
   - Full stack trace
   - User journey leading to error
   - Session replay (if enabled)
   - Related events

## Best Practices

### 1. Use ErrorBoundary at App Level

```typescript
// ✅ Good: Catch all React errors
<PostHogProvider>
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
</PostHogProvider>

// ❌ Bad: No error boundary
<PostHogProvider>
  <App />
</PostHogProvider>
```

### 2. Add Context to Manual Captures

```typescript
// ✅ Good: Include context
posthog.capture("$exception", {
  $exception_type: error.name,
  $exception_message: error.message,
  $exception_stack_trace: error.stack,
  action: "checkout",
  cart_value: 99.99,
  payment_method: "stripe",
});

// ❌ Bad: No context
posthog.capture("$exception", {
  $exception_type: error.name,
  $exception_message: error.message,
});
```

### 3. Link Server Errors to Users

The server error handler automatically extracts user context:

```typescript
// PostHog distinct_id from frontend cookie
// User ID from request.user.id or request.session.userId

// Errors are automatically linked to the same user across platforms!
```

### 4. Don't Capture Sensitive Data

```typescript
// ❌ Bad: Includes sensitive data
posthog.capture("$exception", {
  $exception_message: error.message,
  password: user.password, // NEVER!
  credit_card: payment.cc_number, // NEVER!
});

// ✅ Good: Only non-sensitive metadata
posthog.capture("$exception", {
  $exception_message: error.message,
  user_id: user.id,
  action: "payment_failed",
});
```

### 5. Use Structured Error Messages

```typescript
// ✅ Good: Structured and searchable
throw new Error("Payment failed: Invalid card [stripe_error_123]");

// ❌ Bad: Unstructured
throw new Error("Something went wrong");
```

## Testing Error Tracking

### Web

```typescript
// Trigger test error
function TestErrorButton() {
  return (
    <button onClick={() => {
      throw new Error("Test error from web!");
    }}>
      Trigger Test Error
    </button>
  );
}
```

### Mobile

```typescript
// Trigger test error
<Button
  onPress={() => {
    throw new Error("Test error from mobile!");
  }}
  title="Trigger Test Error"
/>
```

### Server

```typescript
// Add test endpoint
app.get("/api/test-error", async () => {
  throw new Error("Test error from server!");
});
```

## Troubleshooting

### Errors not showing in PostHog

1. **Check API key is set:**

   ```bash
   # Web
   echo $NEXT_PUBLIC_POSTHOG_KEY

   # Mobile
   echo $EXPO_PUBLIC_POSTHOG_KEY

   # Server
   echo $POSTHOG_KEY
   ```

2. **Check error tracking is enabled:**
   - Web: `bootstrap.errorTracking.enabled: true` in config
   - Mobile: Global error handler is set up
   - Server: `posthog-error-handler` plugin is registered

3. **Check browser console:**
   - Enable PostHog debug mode: `posthog.debug()`
   - Look for errors sending events

4. **Check network tab:**
   - Look for requests to PostHog API
   - Check for CORS or network errors

### Duplicate errors

If you're capturing errors both manually and automatically, you may see duplicates. Choose one approach per error type.

### Missing stack traces

Ensure source maps are enabled in production:

- **Web**: Next.js includes source maps by default
- **Mobile**: Enable in Expo build config
- **Server**: Use `--enable-source-maps` flag

## Related Documentation

- [PostHog Error Tracking Docs](https://posthog.com/docs/error-tracking)
- [PostHog Session Replay](https://posthog.com/docs/session-replay)
- [Analytics Package README](./README.md)
