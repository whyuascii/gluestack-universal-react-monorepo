# @app/subscriptions

Multi-provider subscription management with unified entitlements.

- **Web:** Polar for hosted checkout and billing
- **Mobile:** RevenueCat SDK for iOS/Android in-app purchases
- **Server:** Unified webhook processing and entitlements

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
├─────────────────────────────┬───────────────────────────────┤
│           Web               │           Mobile              │
│     Polar Checkout          │      RevenueCat SDK           │
│   (hosted payment page)     │   (native in-app purchase)    │
└─────────────┬───────────────┴───────────────┬───────────────┘
              │                               │
              │ webhook                       │ webhook
              ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Server                                 │
│  processSubscriptionWebhook() → Unified subscription record │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Entitlements                               │
│  getTenantEntitlements() → { tier, features, access }       │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Server-Side (API)

```typescript
// Import server utilities
import {
  processSubscriptionWebhook,
  getTenantEntitlements,
  hasFeatureAccess,
  getProvider,
} from "@app/subscriptions/server";

// Process webhook from any provider
const result = await processSubscriptionWebhook("polar", payload, signature);
if (result.error) return reply.status(401).send(result.error);

// Check tenant entitlements
const entitlements = await getTenantEntitlements(tenantId);
if (entitlements.tier === "pro") {
  // Allow pro features
}

// Check specific feature access
if (await hasFeatureAccess(tenantId, "bulkExport")) {
  // Allow bulk export
}

// Create checkout session (web)
const provider = getProvider("polar");
const { checkoutUrl } = await provider.createCheckout({
  tenantId,
  userId,
  planId: "pro_monthly",
  successUrl: "https://app.example.com/settings?success=true",
});
```

### Client-Side (Mobile)

```tsx
import { RevenueCatProvider, useSubscription, usePaywall } from "@app/subscriptions";

// Wrap app with provider
function App() {
  const { user } = useAuth();
  return (
    <RevenueCatProvider userId={user?.id}>
      <YourApp />
    </RevenueCatProvider>
  );
}

// Check subscription status
function MyComponent() {
  const { isPremium, isLoading } = useSubscription();
  if (isLoading) return <Loading />;
  if (!isPremium) return <UpgradePrompt />;
  return <PremiumContent />;
}

// Show paywall
function UpgradeButton() {
  const { showPaywall } = usePaywall();
  return <Button onPress={showPaywall}>Upgrade</Button>;
}
```

## Environment Variables

```bash
# Polar (web checkout)
POLAR_ACCESS_TOKEN=xxx
POLAR_WEBHOOK_SECRET=xxx
POLAR_ORGANIZATION_ID=xxx

# RevenueCat (mobile in-app purchases)
REVENUECAT_WEBHOOK_SECRET=xxx
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_xxx
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_xxx

# Optional
GRACE_PERIOD_DAYS=7  # Default: 7 days after payment failure
```

## Subscription Status Handling

| Status     | Access       | Notes                          |
| ---------- | ------------ | ------------------------------ |
| `active`   | Full         | Normal subscription            |
| `trialing` | Full         | Trial period                   |
| `past_due` | Grace period | 7 days after payment failure   |
| `canceled` | Until end    | If `cancelAtPeriodEnd` is true |
| `expired`  | None         | Reverts to free tier           |
| `paused`   | None         | Reverts to free tier           |

## Exports

### Client Exports (`@app/subscriptions`)

```typescript
// Providers
import { RevenueCatProvider, useRevenueCatAvailability } from "@app/subscriptions";

// Hooks
import { useSubscription, usePaywall, useRevenueCat } from "@app/subscriptions";

// Components
import { PremiumGate, SubscriptionStatus } from "@app/subscriptions";

// Screens
import { PaywallScreen, SubscriptionScreen } from "@app/subscriptions";

// Helpers
import {
  isRunningInExpoGo,
  isRevenueCatAvailable,
  refreshSubscription,
  restorePurchases,
} from "@app/subscriptions";

// Error handling
import { PurchaseError, parsePurchaseError } from "@app/subscriptions";
```

### Server Exports (`@app/subscriptions/server`)

```typescript
// Webhook processing
import {
  processSubscriptionWebhook,
  updateSubscriptionStatus,
  linkRevenueCatPurchase,
  getSubscription,
} from "@app/subscriptions/server";

// Entitlements
import {
  getTenantEntitlements,
  getUserEntitlements,
  hasTier,
  hasFeatureAccess,
} from "@app/subscriptions/server";

// Provider access
import {
  getProvider,
  polarProvider,
  revenuecatProvider,
  isProviderConfigured,
} from "@app/subscriptions/server";
```

## Adding a New Provider

1. Create `src/providers/<name>.ts` implementing `SubscriptionProvider`:

```typescript
import type { SubscriptionProvider } from "./types";

export const stripeProvider: SubscriptionProvider = {
  name: "stripe",

  verifyWebhook(payload, signature) {
    // Verify signature
    return true;
  },

  parseWebhookEvent(payload) {
    // Parse to WebhookEvent
    return { eventId, eventType, rawPayload };
  },

  mapEventToSubscriptionUpdate(event) {
    // Map to SubscriptionUpdate or return null to ignore
    return { tenantId, status, planId, ... };
  },

  async createCheckout(params) {
    // Create checkout session
    return { checkoutUrl };
  },
};
```

2. Add to `src/providers/types.ts`:

```typescript
export type ProviderName = "polar" | "revenuecat" | "stripe";
```

3. Register in `src/providers/index.ts`:

```typescript
import { stripeProvider } from "./stripe";

const providers = {
  polar: polarProvider,
  revenuecat: revenuecatProvider,
  stripe: stripeProvider,
};
```

## Mobile Limitations

RevenueCat requires native code and **cannot run in Expo Go**. Use a development build:

```bash
eas build --profile development --platform ios
```

The provider automatically detects Expo Go and renders the `unavailableFallback` prop.

## Related

- [`@app/config`](../config) - Subscription tiers and feature definitions
- [`docs/guides/SUBSCRIPTIONS.md`](../../docs/guides/SUBSCRIPTIONS.md) - Full setup guide
