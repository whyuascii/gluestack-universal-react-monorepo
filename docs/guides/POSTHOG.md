# PostHog Integration for API

Server-side PostHog analytics and error tracking for the Fastify API.

## Features

- ✅ **Automatic error tracking** - All uncaught errors are captured
- ✅ **User context** - Errors are linked to users via distinct_id from cookies
- ✅ **Event tracking** - Track custom events from your API routes
- ✅ **User identification** - Identify users with properties
- ✅ **Graceful shutdown** - All events are flushed before shutdown

## Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
POSTHOG_KEY=your_posthog_project_api_key
POSTHOG_HOST=https://us.i.posthog.com
```

### 2. Register Plugins

In your Fastify app setup:

```typescript
import fastify from "fastify";
import posthogErrorHandler from "./plugins/posthog-error-handler";
import posthogAnalytics from "./plugins/posthog-analytics";

const app = fastify();

// Register PostHog plugins
await app.register(posthogAnalytics);
await app.register(posthogErrorHandler); // Register last to catch all errors
```

## Usage

### Automatic Error Tracking

All errors thrown in your routes will be automatically captured:

```typescript
app.get("/api/test", async (request, reply) => {
  throw new Error("This will be automatically captured!");
});
```

### Track Custom Events

Use `request.analytics.track()` in your routes:

```typescript
app.post("/api/users", async (request, reply) => {
  const user = await createUser(request.body);

  // Track user signup
  request.analytics.track("user_signup", {
    user_id: user.id,
    email: user.email,
    signup_method: "email",
  });

  return user;
});
```

### Identify Users

Use `request.analytics.identify()` when a user logs in:

```typescript
app.post("/api/login", async (request, reply) => {
  const user = await authenticateUser(request.body);

  // Identify user
  request.analytics.identify({
    email: user.email,
    name: user.name,
    plan: user.plan,
  });

  return { token: generateToken(user) };
});
```

### Manual Error Capturing

For catching specific errors:

```typescript
import { captureException } from "./lib/posthog-server";

app.get("/api/data", async (request, reply) => {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    captureException(error, {
      userId: request.user?.id,
      properties: {
        action: "fetch_data",
        endpoint: "/api/data",
      },
    });

    throw error; // Will also be caught by error handler
  }
});
```

### Standalone Event Tracking

Track events without request context:

```typescript
import { trackEvent, identifyUser } from "./lib/posthog-server";

// Track background job
trackEvent("job_completed", "system", {
  job_type: "email_batch",
  processed: 1000,
});

// Identify user from background process
identifyUser(userId, {
  subscription_status: "active",
  last_login: new Date(),
});
```

## API Reference

### `request.analytics.track(event, properties?)`

Track a custom event for the current user.

**Parameters:**

- `event` (string) - Event name
- `properties` (object, optional) - Event properties

**Example:**

```typescript
request.analytics.track("button_clicked", {
  button_name: "checkout",
  cart_value: 99.99,
});
```

### `request.analytics.identify(properties?)`

Identify the current user with properties.

**Parameters:**

- `properties` (object, optional) - User properties

**Example:**

```typescript
request.analytics.identify({
  email: "user@example.com",
  plan: "pro",
  company: "Acme Inc",
});
```

### `captureException(error, context?)`

Manually capture an exception.

**Parameters:**

- `error` (Error) - The error object
- `context` (object, optional) - Additional context
  - `distinctId` (string) - PostHog distinct ID
  - `userId` (string) - User ID
  - `properties` (object) - Additional properties

**Example:**

```typescript
captureException(new Error("Payment failed"), {
  userId: "user-123",
  properties: {
    payment_method: "stripe",
    amount: 99.99,
  },
});
```

### `trackEvent(event, distinctId, properties?)`

Track an event with a specific distinct ID.

**Parameters:**

- `event` (string) - Event name
- `distinctId` (string) - User distinct ID
- `properties` (object, optional) - Event properties

### `identifyUser(userId, properties?)`

Identify a user with properties.

**Parameters:**

- `userId` (string) - User ID
- `properties` (object, optional) - User properties

## How It Works

### Error Tracking

1. The `posthog-error-handler` plugin registers a Fastify error handler
2. When an error occurs, it extracts user context from cookies and auth
3. The error is captured with PostHog including stack trace and request details
4. The error is logged and sent as a response

### User Context

User identification works in two ways:

1. **PostHog distinct_id from cookies**: Extracted from the `ph_phc_*_posthog` cookie set by the frontend PostHog client
2. **User ID from auth**: Extracted from `request.user.id` or `request.session.userId` (customize in the plugin)

This ensures server-side events are linked to the same user as frontend events.

### Event Flushing

- Events are batched and flushed every 10 seconds or when 20 events are queued
- On server shutdown (SIGINT/SIGTERM), all pending events are flushed
- This ensures no events are lost

## TypeScript Support

The plugins add TypeScript types to the Fastify request object:

```typescript
declare module "fastify" {
  interface FastifyRequest {
    analytics: {
      track(event: string, properties?: Record<string, any>): void;
      identify(properties?: Record<string, any>): void;
    };
  }
}
```

This provides full autocomplete and type safety when using `request.analytics`.
