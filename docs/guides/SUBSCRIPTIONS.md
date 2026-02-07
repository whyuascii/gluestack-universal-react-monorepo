# Subscriptions Guide

Comprehensive guide for implementing in-app subscriptions using RevenueCat across web and mobile platforms in this monorepo.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Mobile Setup (Expo)](#mobile-setup-expo)
- [Web Setup (Next.js)](#web-setup-nextjs)
- [Provider Configuration](#provider-configuration)
- [Checking Subscription Status](#checking-subscription-status)
- [Implementing Paywalls](#implementing-paywalls)
- [Handling Purchases](#handling-purchases)
- [User Authentication](#user-authentication)
- [Analytics Integration](#analytics-integration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

This monorepo uses RevenueCat for subscription management across platforms:

- **Mobile (iOS/Android)**: `react-native-purchases` + `react-native-purchases-ui`
- **Web**: `@revenuecat/purchases-js`
- **Shared State**: Zustand store for cross-platform subscription state

The `@app/subscriptions` package provides:

- Platform-agnostic hooks and components
- Expo Go detection (graceful fallback)
- Typed error handling
- Analytics integration helpers
- Sync utilities for server-side updates

## Prerequisites

1. **RevenueCat Account**: Sign up at [revenuecat.com](https://www.revenuecat.com)
2. **App Store Connect** (iOS): Configure products and subscriptions
3. **Google Play Console** (Android): Configure products and subscriptions
4. **Stripe** (Web): Connect Stripe to RevenueCat for web payments
5. **Development Build**: RevenueCat cannot run in Expo Go

## Environment Setup

### Environment Variables

Add these to your `.env` files:

```bash
# iOS - Apple App Store API key from RevenueCat dashboard
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_xxxxxxxxxxxxxxxx

# Android - Google Play API key from RevenueCat dashboard
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_xxxxxxxxxxxxxxxx

# Web - Stripe/Web API key from RevenueCat dashboard
NEXT_PUBLIC_REVENUECAT_API_KEY=rcb_xxxxxxxxxxxxxxxx

# Optional: Custom entitlement and product identifiers
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM=premium
EXPO_PUBLIC_REVENUECAT_PRODUCT_MONTHLY=monthly
EXPO_PUBLIC_REVENUECAT_PRODUCT_YEARLY=yearly
NEXT_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM=premium
```

**Important**: Each platform requires its own API key from the RevenueCat dashboard.

## Mobile Setup (Expo)

### 1. Install Dependencies

```bash
cd apps/mobile
npx expo install react-native-purchases react-native-purchases-ui expo-constants
```

### 2. Configure app.json

Add the RevenueCat plugins to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-purchases",
        {
          "iosEntitlementName": "premium"
        }
      ]
    ]
  }
}
```

### 3. Create Development Build

**RevenueCat requires native code and cannot run in Expo Go.**

```bash
# Build for iOS simulator
eas build --profile development --platform ios

# Build for Android emulator
eas build --profile development --platform android

# Or run locally with prebuild
npx expo prebuild
npx expo run:ios
```

### 4. Add Provider to Layout

```tsx
// apps/mobile/src/app/_layout.tsx
import { RevenueCatProvider } from "@app/subscriptions";
import { useAuth } from "@app/auth/client/native";

export default function RootLayout() {
  const { user } = useAuth();

  return (
    <RevenueCatProvider
      userId={user?.id}
      unavailableFallback={<ExpoGoFallback />}
      onCustomerInfoUpdate={(info) => {
        // Track subscription changes
        console.log("Subscription updated:", info);
      }}
    >
      <Stack />
    </RevenueCatProvider>
  );
}

// Fallback UI for Expo Go
function ExpoGoFallback() {
  return (
    <View>
      <Text>Subscriptions unavailable in Expo Go.</Text>
      <Text>Please use a development build.</Text>
    </View>
  );
}
```

### 5. Expo Go Detection

The package automatically detects Expo Go and provides graceful fallbacks:

```tsx
import { isRunningInExpoGo, useRevenueCatAvailability } from "@app/subscriptions";

function MyComponent() {
  const { isAvailable, unavailableReason } = useRevenueCatAvailability();

  if (!isAvailable) {
    return <Text>{unavailableReason}</Text>;
  }

  // Full subscription functionality available
  return <SubscriptionFeatures />;
}
```

## Web Setup (Next.js)

### 1. Install Dependencies

```bash
cd apps/web
pnpm add @revenuecat/purchases-js
```

### 2. Add Provider to Layout

```tsx
// apps/web/src/app/providers.tsx
"use client";

import { RevenueCatProvider } from "@app/subscriptions";
import { useAuth } from "@app/auth/client/react";

export function Providers({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return <RevenueCatProvider userId={user?.id}>{children}</RevenueCatProvider>;
}
```

## Provider Configuration

### Configuration Options

```tsx
import { RevenueCatProvider, LOG_LEVEL } from "@app/subscriptions";

<RevenueCatProvider
  userId={user?.id}
  config={{
    // Log level (default: DEBUG in dev, INFO in prod)
    logLevel: LOG_LEVEL.DEBUG,

    // Use Amazon AppStore instead of Google Play (Android only)
    useAmazon: false,

    // Automatically sync purchases on app foreground
    syncOnForeground: true,

    // Observer mode for handling purchases outside RevenueCat
    observerMode: false,

    // iOS: Share purchases with app extensions
    userDefaultsSuiteName: "group.com.yourapp",

    // iOS: Use StoreKit 2
    storeKitVersion: "STOREKIT_2",
  }}
  onCustomerInfoUpdate={(info) => {
    // Handle subscription state changes
  }}
  onError={(error) => {
    // Handle errors
  }}
  unavailableFallback={<FallbackUI />}
>
  {children}
</RevenueCatProvider>;
```

## Checking Subscription Status

### useSubscription Hook

Platform-agnostic hook for checking subscription status:

```tsx
import { useSubscription } from "@app/subscriptions";

function PremiumFeature() {
  const {
    isPremium, // Boolean: has premium entitlement
    isLoading, // Boolean: initial load in progress
    hasMonthly, // Boolean: has monthly subscription
    hasYearly, // Boolean: has yearly subscription
    expirationDate, // Date | null: when subscription expires
    willRenew, // Boolean: subscription will auto-renew
    activeSubscriptions, // string[]: product IDs of active subscriptions
    hasEntitlement, // (id: string) => boolean: check specific entitlement
  } = useSubscription();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isPremium) {
    return <UpgradePrompt />;
  }

  return <PremiumContent />;
}
```

### PremiumGate Component

Gate content behind subscription:

```tsx
import { PremiumGate } from "@app/subscriptions";

function MyScreen() {
  return (
    <View>
      <Text>Free content here</Text>

      <PremiumGate fallback={<LockedFeature />} loadingFallback={<Skeleton />}>
        <PremiumContent />
      </PremiumGate>

      {/* Auto-show paywall when accessed */}
      <PremiumGate showPaywall>
        <PremiumOnlyScreen />
      </PremiumGate>
    </View>
  );
}
```

### Non-React Contexts

For navigation guards or API interceptors:

```tsx
import { hasActiveEntitlement, getCustomerInfo } from "@app/subscriptions";

// Navigation guard
function canAccessPremiumRoute(): boolean {
  return hasActiveEntitlement("premium");
}

// API request interceptor
function addSubscriptionHeaders(headers: Headers): Headers {
  const customerInfo = getCustomerInfo();
  if (customerInfo) {
    headers.set(
      "X-Subscription-Status",
      customerInfo.activeSubscriptions.length > 0 ? "premium" : "free"
    );
  }
  return headers;
}
```

## Implementing Paywalls

### Native Paywalls (Mobile)

RevenueCat's native paywall UI:

```tsx
import { usePaywall } from "@app/subscriptions";

function UpgradeButton() {
  const { showPaywall, showPaywallIfNeeded, isPaywallVisible } = usePaywall();

  const handleUpgrade = async () => {
    // Show paywall unconditionally
    const result = await showPaywall();

    if (result === "PURCHASED") {
      // Handle successful purchase
      Alert.alert("Welcome to Premium!");
    }
  };

  const handleAccessPremiumFeature = async () => {
    // Show paywall only if user doesn't have premium
    const result = await showPaywallIfNeeded("premium");

    if (result === "NOT_PRESENTED") {
      // User already has premium, proceed
      navigateToPremiumFeature();
    } else if (result === "PURCHASED") {
      navigateToPremiumFeature();
    }
  };

  return <Button title="Upgrade to Premium" onPress={handleUpgrade} disabled={isPaywallVisible} />;
}
```

### Custom Paywalls (Web)

Build custom paywall UI for web:

```tsx
import { usePaywall, useRevenueCat } from "@app/subscriptions";

function CustomPaywall() {
  const { isPaywallVisible, dismissPaywall, onPurchaseSuccess } = usePaywall();
  const { getOfferings, purchasePackage } = useRevenueCat();
  const [offerings, setOfferings] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    getOfferings().then(setOfferings);
  }, []);

  const handlePurchase = async (pkg) => {
    try {
      setPurchasing(true);
      await purchasePackage(pkg);
      onPurchaseSuccess();
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setPurchasing(false);
    }
  };

  if (!isPaywallVisible) return null;

  return (
    <Modal visible onClose={() => dismissPaywall("CANCELLED")}>
      <h2>Upgrade to Premium</h2>

      {offerings?.current?.availablePackages.map((pkg) => (
        <PackageCard
          key={pkg.identifier}
          package={pkg}
          onSelect={() => handlePurchase(pkg)}
          disabled={purchasing}
        />
      ))}

      <Button onClick={() => dismissPaywall("CANCELLED")}>Maybe Later</Button>
    </Modal>
  );
}
```

## Handling Purchases

### Direct Purchase Flow

```tsx
import { useRevenueCat, parsePurchaseError } from "@app/subscriptions";

function PurchaseFlow() {
  const { getOfferings, purchasePackage, restorePurchases } = useRevenueCat();
  const [offerings, setOfferings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const result = await getOfferings();
      setOfferings(result);
    } catch (err) {
      setError(parsePurchaseError(err));
    }
  };

  const handlePurchase = async (pkg) => {
    try {
      const customerInfo = await purchasePackage(pkg);

      if (customerInfo.entitlements.active["premium"]) {
        // Purchase successful!
        navigation.navigate("PremiumWelcome");
      }
    } catch (err) {
      const purchaseError = parsePurchaseError(err);

      if (purchaseError.isCancelled) {
        // User cancelled - not an error
        return;
      }

      if (purchaseError.isRecoverable) {
        setError(purchaseError.userMessage);
      } else {
        // Log to analytics
        console.error("Purchase failed:", purchaseError);
        setError("Something went wrong. Please try again.");
      }
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await restorePurchases();

      if (customerInfo.entitlements.active["premium"]) {
        Alert.alert("Purchases Restored", "Welcome back to Premium!");
      } else {
        Alert.alert("No Purchases Found", "We couldn't find any previous purchases.");
      }
    } catch (err) {
      const purchaseError = parsePurchaseError(err);
      setError(purchaseError.userMessage);
    }
  };

  return (
    <View>
      {error && <ErrorBanner message={error} />}

      {offerings?.current?.availablePackages.map((pkg) => (
        <ProductCard
          key={pkg.identifier}
          title={pkg.product.title}
          price={pkg.product.priceString}
          onPurchase={() => handlePurchase(pkg)}
        />
      ))}

      <Button onPress={handleRestore}>Restore Purchases</Button>
    </View>
  );
}
```

### Error Handling

```tsx
import {
  PurchaseError,
  PurchaseErrorCode,
  parsePurchaseError,
  shouldLogError,
} from "@app/subscriptions";

async function handlePurchase(pkg) {
  try {
    await purchasePackage(pkg);
  } catch (err) {
    const error = parsePurchaseError(err);

    switch (error.code) {
      case PurchaseErrorCode.PURCHASE_CANCELLED:
        // User cancelled - do nothing
        break;

      case PurchaseErrorCode.NETWORK_ERROR:
      case PurchaseErrorCode.STORE_PROBLEM:
        // Recoverable - show retry
        showError("Connection issue. Please try again.");
        break;

      case PurchaseErrorCode.PRODUCT_ALREADY_PURCHASED:
        // User already has this - offer restore
        showRestoreOption();
        break;

      case PurchaseErrorCode.EXPO_GO_NOT_SUPPORTED:
        // Running in Expo Go
        showDevBuildPrompt();
        break;

      default:
        // Log unexpected errors
        if (shouldLogError(error)) {
          analytics.track("purchase_error", {
            code: error.code,
            message: error.message,
          });
        }
        showError(error.userMessage);
    }
  }
}
```

## User Authentication

### Syncing with Better Auth

```tsx
import { useAuth } from "@app/auth/client/react";
import { RevenueCatProvider } from "@app/subscriptions";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <RevenueCatProvider
      // Pass user ID to associate purchases with account
      userId={user?.id}
      onCustomerInfoUpdate={(info) => {
        // Update user profile with subscription status
        if (user) {
          updateUserSubscriptionStatus(user.id, {
            isPremium: Object.keys(info.entitlements.active).length > 0,
            expiresAt: getLatestExpiration(info),
          });
        }
      }}
    >
      <YourApp />
    </RevenueCatProvider>
  );
}
```

### Manual Auth Sync

```tsx
import { loginUser, logoutUser, setUserAttributes } from "@app/subscriptions";

// After successful login
async function onLoginSuccess(user) {
  // Associate purchases with user
  await loginUser(user.id);

  // Set user attributes for RevenueCat
  await setUserAttributes({
    email: user.email,
    displayName: user.name,
    customAttributes: {
      signup_date: user.createdAt.toISOString(),
      referral_source: user.referralSource,
    },
  });
}

// After logout
async function onLogout() {
  // Reset to anonymous user
  await logoutUser();
}
```

## Analytics Integration

### Track Subscription Events

```tsx
import {
  formatPaywallViewedEvent,
  formatPurchaseCompletedEvent,
  formatPurchaseFailedEvent,
  extractUserPropertiesFromSubscription,
} from "@app/subscriptions";
import { analytics } from "@app/analytics/mobile";

// Track paywall view
function PaywallScreen() {
  useEffect(() => {
    const event = formatPaywallViewedEvent({
      source: "settings_upgrade_button",
      offeringId: "premium_offering",
    });
    analytics.track("paywall_viewed", event);
  }, []);
}

// Track purchase
async function handlePurchase(pkg) {
  const startEvent = formatPurchaseStartedEvent({
    productId: pkg.product.identifier,
    price: pkg.product.price,
    currency: pkg.product.currencyCode,
  });
  analytics.track("purchase_started", startEvent);

  try {
    const customerInfo = await purchasePackage(pkg);

    const event = formatPurchaseCompletedEvent(customerInfo, pkg.product.identifier, "premium", {
      price: pkg.product.price,
      currency: pkg.product.currencyCode,
    });
    analytics.track("subscription_purchased", event);

    // Update user properties
    const userProps = extractUserPropertiesFromSubscription(customerInfo);
    analytics.identify(userId, userProps);
  } catch (err) {
    const error = parsePurchaseError(err);
    if (!error.isCancelled) {
      const event = formatPurchaseFailedEvent(error.code, error.message, pkg.product.identifier);
      analytics.track("purchase_failed", event);
    }
  }
}
```

### Subscription Metrics

```tsx
import { calculateSubscriptionMetrics } from "@app/subscriptions";

function SubscriptionDashboard() {
  const { customerInfo } = useSubscription();

  const metrics = calculateSubscriptionMetrics(customerInfo);

  return (
    <View>
      <Stat label="Status" value={metrics.isSubscribed ? "Premium" : "Free"} />
      <Stat label="Days as customer" value={metrics.daysSinceFirstPurchase} />
      <Stat label="Days until renewal" value={metrics.daysUntilExpiration} />
      <Stat label="Active entitlements" value={metrics.activeEntitlements} />
    </View>
  );
}
```

## Testing

### Sandbox Testing

1. **iOS**: Use Sandbox testers in App Store Connect
2. **Android**: Use license testers in Google Play Console
3. **RevenueCat Dashboard**: Use debug API keys in development

### Testing in Development Builds

```bash
# Create development build with sandbox environment
eas build --profile development --platform ios

# Install and test with sandbox account
```

### Mock Subscriptions

For unit tests or demos:

```tsx
// Mock subscription state for testing
import { useSubscriptionStore } from "@app/subscriptions";

function mockPremiumUser() {
  useSubscriptionStore.setState({
    customerInfo: {
      activeSubscriptions: ["premium_monthly"],
      allPurchasedProductIdentifiers: ["premium_monthly"],
      entitlements: {
        active: {
          premium: {
            identifier: "premium",
            isActive: true,
            productIdentifier: "premium_monthly",
            purchaseDate: new Date(),
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        all: {},
      },
      originalAppUserId: "test_user",
      originalApplicationVersion: null,
      requestDate: new Date(),
    },
    isLoading: false,
    error: null,
  });
}
```

## Troubleshooting

### Common Issues

#### "RevenueCat is not available in Expo Go"

RevenueCat requires native code. You must use a development build:

```bash
# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Or use local development
npx expo prebuild
npx expo run:ios
```

#### "Invalid API key"

- Ensure you're using the correct platform-specific API key
- iOS uses `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`
- Android uses `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`
- Web uses `NEXT_PUBLIC_REVENUECAT_API_KEY`

#### "Products not found"

1. Check RevenueCat dashboard for product configuration
2. Ensure products are approved in App Store Connect / Google Play Console
3. Wait for store sync (can take up to 24 hours for new products)

#### "Purchases not syncing"

```tsx
// Force sync purchases
import { syncPurchases, refreshSubscription } from "@app/subscriptions";

// On app resume or manual refresh
await syncPurchases();
await refreshSubscription();
```

### Debug Logging

Enable verbose logging:

```tsx
import { LOG_LEVEL } from "@app/subscriptions";

<RevenueCatProvider
  config={{
    logLevel: LOG_LEVEL.VERBOSE,
  }}
>
```

### Environment Info

Check environment status:

```tsx
import { getEnvironmentInfo } from "@app/subscriptions";

const info = getEnvironmentInfo();
console.log(info);
// {
//   platform: "ios",
//   isExpoGo: false,
//   isDevBuild: true,
//   isRevenueCatAvailable: true,
//   unavailableReason: null
// }
```

## Further Resources

- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [RevenueCat Expo Guide](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [App Store Subscriptions Guide](https://developer.apple.com/app-store/subscriptions/)
- [Google Play Billing](https://developer.android.com/google/play/billing)
