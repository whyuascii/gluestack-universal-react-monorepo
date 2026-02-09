# packages/analytics — PostHog + OpenTelemetry

Privacy-first analytics with platform-specific providers and server-side logging.

## Structure

```
src/
├── config/
│   ├── posthog.web.ts          # Web PostHog init (cookieless mode)
│   └── posthog.mobile.ts       # Mobile PostHog init
├── providers/
│   ├── PostHogProvider.web.tsx  # Web React context
│   └── PostHogProvider.mobile.tsx
├── helpers/
│   ├── analytics.web.ts        # trackEvent, identifyUser, trackPageView
│   └── analytics.mobile.ts     # trackEvent, trackScreen, flushEvents
├── hooks/
│   ├── useScreenTracking.web.ts
│   ├── useScreenTracking.mobile.ts
│   ├── useFeatureFlags.mobile.ts
│   └── usePostHogSurvey.web.ts
├── server/
│   ├── posthog.ts              # Server-side PostHog client (singleton)
│   ├── logger.ts               # OTEL logger (Pino-compatible API)
│   ├── middleware.ts           # Fastify middleware (extracts trace headers)
│   └── otel-config.ts          # OpenTelemetry → PostHog setup
├── components/
│   ├── ErrorBoundary.tsx       # Web error boundary
│   └── ErrorBoundary.native.tsx
├── events/
│   ├── allowlist.ts            # Privacy-safe event whitelist (50+ events)
│   └── scrubber.ts             # PII stripping from event properties
├── index.ts                    # Shared types only
├── web.ts                      # @app/analytics/web exports
├── mobile.ts                   # @app/analytics/mobile exports
└── server.ts                   # @app/analytics/server exports
```

## Entry Points

```typescript
// Web (apps/web)
import { PostHogProvider, trackEvent } from "@app/analytics/web";

// Mobile (apps/mobile)
import { PostHogProvider, trackScreen } from "@app/analytics/mobile";

// Server (apps/api)
import { initServerAnalytics, createLogger, analyticsMiddleware } from "@app/analytics/server";
```

## Platform Differences

| Feature  | Web                       | Mobile                               |
| -------- | ------------------------- | ------------------------------------ |
| Library  | `posthog-js`              | `posthog-react-native`               |
| Env var  | `NEXT_PUBLIC_POSTHOG_KEY` | `EXPO_PUBLIC_POSTHOG_KEY`            |
| Cookies  | Cookieless mode (GDPR)    | N/A                                  |
| Tracking | `trackPageView()`         | `trackScreen()`                      |
| Flush    | Automatic                 | Manual `flushEvents()` on background |

## Server-Side Logging (OTEL)

```typescript
const logger = createLogger({ serviceName: "api" });
logger.info("User created", { userId, traceId });
logger.error("Payment failed", { error, userId });
```

- Sends WARN/ERROR to PostHog via OTLP endpoint
- Request-scoped via `createRequestLogger(baseLogger, analyticsContext)`
- Middleware extracts: `x-trace-id`, `x-posthog-distinct-id`, `x-posthog-session-id`

## Event Privacy

Events must be in the allowlist (`events/allowlist.ts`). Properties are PII-scrubbed:

```typescript
const result = scrubEvent("auth.login", { method: "email" });
```

## Feature Flags (Server)

```typescript
import { isFeatureFlagEnabled } from "@app/analytics/server";
const enabled = await isFeatureFlagEnabled("new-feature", userId);
```

## Rules

- Use platform-specific imports (`/web`, `/mobile`, `/server`) — never the root
- All events must be in the allowlist
- Never send PII in event properties — the scrubber catches common patterns
- Web uses cookieless mode — no tracking cookies
- Analytics event names and PostHog property keys stay in English (not i18n)
