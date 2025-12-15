# RevenueCat Integration Guide

Complete RevenueCat integration for cross-platform subscription management.

## Features

- ✅ Cross-platform support (iOS, Android, Web)
- ✅ Auto-sync with authentication state
- ✅ Built-in paywall UI (native) and custom paywall screen (web)
- ✅ Customer Center support (native only)
- ✅ Feature gating components
- ✅ Subscription status display
- ✅ Restore purchases
- ✅ Type-safe entitlement checking

## Quick Start

### 1. Environment Setup

**Web App (`apps/web`):**

Create `apps/web/.env.local`:

```bash
# Required
NEXT_PUBLIC_REVENUECAT_API_KEY=test_yLQEesZEIhjFoUuUVUoEnUusCRf
```

**Mobile App (`apps/mobile`):**

Create `apps/mobile/.env`:

```bash
# Required
EXPO_PUBLIC_REVENUECAT_API_KEY=test_yLQEesZEIhjFoUuUVUoEnUusCRf
```

**Quick copy:**

```bash
# Web
cd apps/web && cp .env.example .env.local

# Mobile
cd apps/mobile && cp .env.example .env
```

### 2. Get Your API Key

1. Go to https://app.revenuecat.com/
2. Create a project (or use existing)
3. Navigate to **API Keys** in the dashboard
4. Copy your **Public API Key**
5. Paste into your `.env.local` or `.env` file

**Important:** Use `test_*` prefixed keys for development!

### 3. Restart Dev Servers

```bash
# Web
pnpm --filter web dev

# Mobile
pnpm --filter mobile dev
```

The providers are already configured in both apps - just add your API key!

## Usage Examples

### 1. Check Subscription Status

```typescript
import { useSubscription } from "ui";

function MyComponent() {
  const { isPremium, isLoading, hasMonthly, hasYearly } = useSubscription();

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Premium Status: {isPremium ? "Active" : "Not Active"}</Text>
      <Text>Monthly: {hasMonthly ? "Yes" : "No"}</Text>
      <Text>Yearly: {hasYearly ? "Yes" : "No"}</Text>
    </View>
  );
}
```

### 2. Gate Content Behind Premium

```typescript
import { PremiumGate } from "ui";

function PremiumFeature() {
  return (
    <PremiumGate
      showPaywall={true} // Auto-show paywall if not premium
      loadingFallback={<ActivityIndicator />}
    >
      <Text>This content is only visible to premium users!</Text>
    </PremiumGate>
  );
}

// Or with a custom fallback
function PremiumFeatureWithFallback() {
  return (
    <PremiumGate
      fallback={
        <View>
          <Text>Upgrade to access this feature</Text>
          <Button onPress={() => {}}>Upgrade Now</Button>
        </View>
      }
    >
      <AdvancedFeature />
    </PremiumGate>
  );
}
```

### 3. Present the Paywall

**Native (iOS/Android):**

```typescript
import { usePaywall } from "ui";

function MyScreen() {
  const { showPaywall, showPaywallIfNeeded } = usePaywall();

  const handleUpgrade = async () => {
    // Show paywall
    const result = await showPaywall();

    if (result === "PURCHASED") {
      console.log("User subscribed!");
    } else if (result === "CANCELLED") {
      console.log("User cancelled");
    }
  };

  const handleFeatureAccess = async () => {
    // Only show paywall if user doesn't have entitlement
    const result = await showPaywallIfNeeded("Sample App");

    if (result === "NOT_PRESENTED") {
      // User already has access
      navigateToFeature();
    }
  };

  return (
    <View>
      <Button onPress={handleUpgrade}>Upgrade</Button>
      <Button onPress={handleFeatureAccess}>Access Premium Feature</Button>
    </View>
  );
}
```

**Web:**

```typescript
import { PaywallScreen } from "ui";

function MyScreen() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <View>
      <Button onPress={() => setShowPaywall(true)}>Upgrade</Button>

      <PaywallScreen
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
      />
    </View>
  );
}
```

### 4. Display Subscription Status

```typescript
import { SubscriptionStatus } from "ui";

function SettingsScreen() {
  const router = useRouter();

  return (
    <View>
      <SubscriptionStatus
        onManagePress={() => {
          // Navigate to subscription management
          router.push("/subscription");
        }}
        onUpgradePress={() => {
          // Show paywall or navigate to upgrade screen
          router.push("/upgrade");
        }}
      />
    </View>
  );
}
```

### 5. Full Subscription Management Screen

```typescript
import { SubscriptionScreen } from "ui";

// Use as a screen in your navigation
export default function ManageSubscription() {
  return <SubscriptionScreen />;
}
```

### 6. Advanced: Direct SDK Access

For advanced use cases, you can access the SDK directly:

```typescript
import { useRevenueCat } from "ui";

function AdvancedComponent() {
  const {
    getOfferings,
    purchasePackage,
    restorePurchases,
    presentCustomerCenter,
    isCustomerCenterAvailable,
  } = useRevenueCat();

  const handleCustomPurchase = async () => {
    // Get available offerings
    const offerings = await getOfferings();
    const currentOffering = offerings.current;

    if (currentOffering?.availablePackages) {
      // Purchase a specific package
      const pkg = currentOffering.availablePackages[0];
      await purchasePackage(pkg);
    }
  };

  const handleRestore = async () => {
    const customerInfo = await restorePurchases();
    console.log("Restored:", customerInfo);
  };

  const handleManage = () => {
    if (isCustomerCenterAvailable) {
      // Native only - shows Customer Center modal
      presentCustomerCenter();
    } else {
      // Web - redirect to external management
      window.open("https://apps.apple.com/account/subscriptions");
    }
  };

  return (
    <View>
      <Button onPress={handleCustomPurchase}>Custom Purchase</Button>
      <Button onPress={handleRestore}>Restore Purchases</Button>
      <Button onPress={handleManage}>Manage Subscription</Button>
    </View>
  );
}
```

### 7. Check Custom Entitlements

```typescript
import { useSubscription } from "ui";

function CustomEntitlementCheck() {
  const { hasEntitlement } = useSubscription();

  const hasCustomFeature = hasEntitlement("some-custom-entitlement");

  return (
    <View>
      {hasCustomFeature && <CustomFeature />}
    </View>
  );
}
```

### 8. Get Subscription Details

```typescript
import { useSubscription } from "ui";

function SubscriptionDetails() {
  const {
    customerInfo,
    expirationDate,
    willRenew,
    activeSubscriptions,
  } = useSubscription();

  return (
    <View>
      <Text>Active Subscriptions: {activeSubscriptions.join(", ")}</Text>
      <Text>Expires: {expirationDate?.toLocaleDateString()}</Text>
      <Text>Will Renew: {willRenew ? "Yes" : "No"}</Text>
      <Text>User ID: {customerInfo?.originalAppUserId}</Text>
    </View>
  );
}
```

## Adding to Navigation

### Mobile (Expo Router)

Create a subscription screen in your app:

```typescript
// apps/mobile/src/app/(app)/subscription.tsx
import { SubscriptionScreen } from "ui";

export default function Subscription() {
  return <SubscriptionScreen />;
}
```

### Web (Next.js)

```typescript
// apps/web/src/app/subscription/page.tsx
"use client";

import { SubscriptionScreen } from "ui";

export default function SubscriptionPage() {
  return <SubscriptionScreen />;
}
```

## Configuration

Configuration is loaded from environment variables for better security.

### Environment Variables

#### Required

| Variable                         | Platform | Description               |
| -------------------------------- | -------- | ------------------------- |
| `NEXT_PUBLIC_REVENUECAT_API_KEY` | Web      | RevenueCat public API key |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` | Mobile   | RevenueCat public API key |

#### Optional (with defaults)

| Variable                           | Default      | Description                     |
| ---------------------------------- | ------------ | ------------------------------- |
| `*_REVENUECAT_ENTITLEMENT_PREMIUM` | `Sample App` | Premium entitlement identifier  |
| `*_REVENUECAT_PRODUCT_MONTHLY`     | `monthly`    | Monthly subscription product ID |
| `*_REVENUECAT_PRODUCT_YEARLY`      | `yearly`     | Yearly subscription product ID  |
| `*_REVENUECAT_DEFAULT_OFFERING`    | `default`    | Default offering identifier     |

### Where to Configure

**API Keys:**

- RevenueCat Dashboard → Projects → API Keys
- Use **Public API Key** (not Secret Key)

**Entitlements:**

- RevenueCat Dashboard → Entitlements
- Must match exactly (case-sensitive)

**Products:**

- Apple: App Store Connect → In-App Purchases
- Google: Play Console → Monetize → Products
- Must match exactly

**Offerings:**

- RevenueCat Dashboard → Offerings
- Default offering is typically called "default"

## Platform Differences

### Native (iOS/Android)

- ✅ Built-in paywall UI from RevenueCat
- ✅ Customer Center support
- ✅ Native purchase dialogs
- ✅ StoreKit/Google Play integration

### Web

- ✅ Custom paywall UI (fully customizable)
- ❌ No Customer Center (use external links)
- ✅ Stripe/Paddle integration via RevenueCat
- ✅ Same subscription logic as native

## Testing

Use the test API key for development:

- Test purchases won't charge real money
- Use sandbox accounts on iOS/Android
- Web purchases go through Stripe test mode

## Production Checklist

Before going to production:

1. ✅ **Set production API keys** in environment variables (Vercel/EAS)
2. ✅ **Configure products** in RevenueCat dashboard
3. ✅ **Set up entitlements** in RevenueCat dashboard
4. ✅ **Configure App Store Connect** / Google Play Console
5. ✅ **Test purchases** in sandbox/test mode
6. ✅ **Set up webhooks** for backend integration
7. ✅ **Configure customer support** links
8. ✅ **Add privacy policy** and terms of service

### Production Environment Setup

**Vercel (Web):**

```bash
# In Vercel dashboard: Settings → Environment Variables
NEXT_PUBLIC_REVENUECAT_API_KEY=your_production_key
```

**EAS (Mobile):**

Option 1 - `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_REVENUECAT_API_KEY": "your_production_key"
      }
    }
  }
}
```

Option 2 - EAS Secrets (recommended):

```bash
eas secret:create --scope project \
  --name EXPO_PUBLIC_REVENUECAT_API_KEY \
  --value your_production_key
```

## Troubleshooting

### "Missing required environment variable: REVENUECAT_API_KEY"

**Cause:** API key not set in environment.

**Solution:**

1. Check `.env.local` (web) or `.env` (mobile) exists
2. Verify variable name:
   - Web: `NEXT_PUBLIC_REVENUECAT_API_KEY`
   - Mobile: `EXPO_PUBLIC_REVENUECAT_API_KEY`
3. Restart dev server

### Environment variables not updating

**Web:**

- Next.js caches env vars at build time
- Solution: Restart dev server (`pnpm --filter web dev`)

**Mobile:**

- Expo needs restart to pick up new env vars
- Solution: Restart with clear cache (`expo start -c`)

### Purchases not working

- Check API key is correct in environment variables
- Verify products are configured in RevenueCat dashboard
- Ensure app bundle ID matches RevenueCat configuration
- Check sandbox account is signed in (iOS/Android)

### Entitlements not showing

- Verify entitlement ID matches RevenueCat configuration exactly
- Check product is attached to offering in RevenueCat dashboard
- Wait a few seconds for entitlements to sync after purchase

### Customer info not syncing

- Check internet connection
- Verify RevenueCat SDK initialized successfully (check logs)
- Try calling `restorePurchases()` manually

## Support

For RevenueCat-specific issues, see:

- [RevenueCat Documentation](https://docs.revenuecat.com)
- [RevenueCat Support](https://support.revenuecat.com)
