# Feature Implementation Guides

Guides for implementing specific product features and third-party integrations.

## Available Guides

### [Authentication](./authentication.md)

Setting up user authentication with Better Auth:

- Email/password authentication
- OAuth providers (Google, GitHub)
- Session management
- Protected routes
- User registration and login flows

**Use this when:**

- Adding user accounts
- Implementing login/signup
- Adding social authentication
- Protecting routes

### [Analytics](./analytics.md)

Implementing event tracking with PostHog:

- Setting up PostHog
- Tracking custom events
- User identification
- Feature flags
- A/B testing
- Session recording

**Use this when:**

- Adding product analytics
- Tracking user behavior
- Running experiments
- Implementing feature flags

### [Error Tracking](./error-tracking.md)

Monitoring errors with PostHog:

- Automatic error capture
- ErrorBoundary components
- Custom error reporting
- Error grouping and filtering
- Source map configuration

**Use this when:**

- Monitoring production errors
- Debugging user issues
- Tracking error rates
- Setting up alerts

### [Subscriptions](./subscriptions.md)

In-app purchases and subscriptions with RevenueCat:

- RevenueCat setup
- Product configuration
- Paywall implementation
- Subscription status checking
- Premium feature gating
- Purchase restoration

**Use this when:**

- Implementing paid features
- Adding subscriptions
- Creating paywalls
- Managing entitlements

### [Internationalization](./internationalization.md)

Multi-language support with i18next:

- Setting up i18n
- Adding translations
- Language detection
- Platform-specific configuration
- Translation management
- Pluralization and formatting

**Use this when:**

- Supporting multiple languages
- Localizing content
- Adding new translations
- Implementing language switching

## Quick Reference

### Authentication

```typescript
import { useAuth } from "auth/client/react";

const { signIn, signUp, signOut } = useAuth();

await signIn.email({ email, password });
```

### Analytics

```typescript
import { analytics } from "analytics/web";

analytics.track("button_clicked", { button_id: "signup" });
analytics.identify(userId, { plan: "premium" });
```

### Subscriptions

```typescript
import { useSubscription, PremiumGate } from "ui";

const { isPremium } = useSubscription();

<PremiumGate fallback={<Paywall />}>
  <PremiumFeature />
</PremiumGate>
```

### i18n

```typescript
import { useTranslation } from "i18n/web";

const { t, i18n } = useTranslation();

<Text>{t("common.welcome")}</Text>
<Button onPress={() => i18n.changeLanguage("es")}>
  Español
</Button>
```

## Environment Variables

Each feature requires specific environment variables. See individual guides for details.

**Quick checklist:**

- [ ] Authentication - `BETTER_AUTH_SECRET`, OAuth credentials
- [ ] Analytics - `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] Subscriptions - `NEXT_PUBLIC_REVENUECAT_API_KEY`
- [ ] Error Tracking - Same as Analytics

## Related Documentation

- **[Auth Package Reference](../../reference/packages/auth.md)** - Authentication API
- **[Getting Started](../../getting-started.md)** - Environment setup
- **[Concepts](../../concepts/)** - Understanding the architecture
