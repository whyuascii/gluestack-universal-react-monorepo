---
name: feature-flags
description: Use when adding feature flags, A/B tests (experiments), or surveys. Handles PostHog feature flag setup across web, mobile, and API with proper tracking for experiments.
---

# Feature Flags & Experiments

Implement feature flags, A/B tests, and surveys using PostHog.

**Announce:** "I'm using the feature-flags skill to implement feature flags/experiments."

## Quick Reference

| Platform   | Import                  | Feature Flags           | Experiments                | Surveys                 |
| ---------- | ----------------------- | ----------------------- | -------------------------- | ----------------------- |
| **Web**    | `@app/analytics/web`    | `useFeatureFlagEnabled` | `useFeatureFlagVariantKey` | `usePostHogSurvey`      |
| **Mobile** | `@app/analytics/mobile` | `useFeatureFlagEnabled` | `useFeatureFlagVariantKey` | `PostHogSurveyProvider` |
| **API**    | `@app/analytics/server` | `isFeatureFlagEnabled`  | `getFeatureFlag`           | N/A                     |

## Feature Flags

### Web Usage (React Hooks)

```tsx
import { useFeatureFlagEnabled, useFeatureFlagPayload, PostHogFeature } from "@app/analytics/web";

function MyComponent() {
  // Check if flag is enabled (boolean)
  const isNewDashboardEnabled = useFeatureFlagEnabled("new-dashboard");

  // Get flag payload (JSON configuration)
  const dashboardConfig = useFeatureFlagPayload("new-dashboard");

  if (isNewDashboardEnabled) {
    return <NewDashboard config={dashboardConfig} />;
  }
  return <OldDashboard />;
}

// Or use the PostHogFeature component (auto-tracks exposure)
function FeatureGatedComponent() {
  return (
    <PostHogFeature flag="new-feature" match={true}>
      <NewFeature />
    </PostHogFeature>
  );
}
```

### Mobile Usage (React Native)

```tsx
import {
  useFeatureFlagEnabled,
  useFeatureFlagPayload,
  useFeatureFlag,
} from "@app/analytics/mobile";

function MyScreen() {
  // Check if flag is enabled
  const isEnabled = useFeatureFlagEnabled("new-onboarding");

  // Get raw flag value (for multivariate)
  const variant = useFeatureFlag("onboarding-variant");

  if (!isEnabled) {
    return <OldOnboarding />;
  }

  return variant === "v2" ? <OnboardingV2 /> : <OnboardingV1 />;
}
```

### Server-Side (API)

```typescript
import {
  isFeatureFlagEnabled,
  getFeatureFlag,
  getFeatureFlagPayload,
  getAllFeatureFlags,
} from "@app/analytics/server";

// In an API action
async function myAction(context: AuthContext) {
  const userId = context.user.id;

  // Check boolean flag
  const betaEnabled = await isFeatureFlagEnabled("beta-features", userId);

  // Get variant for experiments
  const variant = await getFeatureFlag("pricing-experiment", userId);

  // Get JSON payload
  const config = await getFeatureFlagPayload("feature-config", userId);

  // Get all flags (for bootstrapping client)
  const allFlags = await getAllFeatureFlags(userId);

  if (betaEnabled) {
    // Beta feature logic
  }
}
```

### Outside React (Helper Functions)

```typescript
// Web
import { isFeatureEnabled, getFeatureFlagPayload, reloadFeatureFlags } from "@app/analytics/web";

// Mobile
import { isFeatureEnabled, getFeatureFlagPayload, reloadFeatureFlags } from "@app/analytics/mobile";

// Check flag (sync on web, async on mobile)
const enabled = await isFeatureEnabled("my-flag");

// Get payload
const config = getFeatureFlagPayload("my-flag");

// Force reload flags
reloadFeatureFlags();
```

## A/B Tests (Experiments)

Experiments use multivariate feature flags with variant keys.

### Setting Up an Experiment

1. **Create experiment in PostHog** (Experiments tab → New experiment)
   - Set feature flag key (e.g., `checkout-experiment`)
   - Define variants: `control`, `test-a`, `test-b`
   - Set goal metrics

2. **Implement in code**

```tsx
import { useFeatureFlagVariantKey, useFeatureFlagPayload } from "@app/analytics/web";

function CheckoutButton() {
  // Get the assigned variant
  const variant = useFeatureFlagVariantKey("checkout-experiment");

  // IMPORTANT: Always use useFeatureFlagPayload too for experiment tracking
  // This ensures the $feature_flag_called event is sent
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

3. **Track conversion events**

```typescript
import { trackEvent } from "@app/analytics/web";

function handleCheckoutComplete() {
  // Track the goal event that PostHog will measure
  trackEvent("checkout_completed", {
    value: orderTotal,
    currency: "USD",
  });
}
```

### Experiment Best Practices

- Always use `useFeatureFlagPayload` alongside variant checks (ensures tracking)
- Track clear conversion events for goal measurement
- Keep experiments focused on single changes
- Run for statistical significance (PostHog shows this)
- Document experiment hypothesis in PostHog

## Surveys

### Web Surveys

Surveys display automatically when conditions match (popover surveys).

For custom survey UIs:

```tsx
import { usePostHogSurvey } from "@app/analytics/web";

function SurveyComponent() {
  const {
    surveys,
    activeSurvey,
    captureSurveyResponse,
    captureSurveyShown,
    captureSurveyDismissed,
  } = usePostHogSurvey();

  if (!activeSurvey) return null;

  const handleSubmit = (response: Record<string, unknown>) => {
    captureSurveyResponse(activeSurvey.id, response);
  };

  const handleDismiss = () => {
    captureSurveyDismissed(activeSurvey.id);
  };

  // Render custom survey UI
  return <CustomSurveyUI survey={activeSurvey} onSubmit={handleSubmit} onDismiss={handleDismiss} />;
}
```

### Mobile Surveys

```tsx
// In app root layout
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

## Bootstrapping Flags (Server-Side Rendering)

For instant feature flag availability on page load:

```typescript
// pages/api/flags.ts or server component
import { getAllFeatureFlags } from "@app/analytics/server";

export async function getServerSideProps({ req }) {
  const userId = getUserIdFromSession(req);
  const flags = await getAllFeatureFlags(userId);

  return {
    props: {
      bootstrapFlags: flags,
    },
  };
}
```

Then pass to PostHog initialization for immediate availability.

## Environment Variables

```bash
# Required for feature flags
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
EXPO_PUBLIC_POSTHOG_KEY=phc_your_key
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_KEY=phc_your_key  # Server-side
POSTHOG_HOST=https://us.i.posthog.com
```

## Checklist: Adding a Feature Flag

- [ ] Create feature flag in PostHog dashboard
- [ ] Set targeting rules (percentage, user properties, etc.)
- [ ] Implement flag check in code (web/mobile/api)
- [ ] Add fallback behavior for when flag is off
- [ ] Test both enabled and disabled states
- [ ] Document flag purpose in PostHog description

## Checklist: Running an Experiment

- [ ] Define hypothesis and success metrics
- [ ] Create experiment in PostHog with variants
- [ ] Implement variant logic using `useFeatureFlagVariantKey`
- [ ] Include `useFeatureFlagPayload` for proper tracking
- [ ] Add conversion event tracking
- [ ] Set up experiment in PostHog with goal metric
- [ ] Monitor experiment until statistical significance
- [ ] Document results and roll out winning variant

## Checklist: Adding a Survey

- [ ] Create survey in PostHog with questions
- [ ] Set display conditions (page, user segment, etc.)
- [ ] For mobile: Add `PostHogSurveyProvider` to layout
- [ ] For custom UI: Use `usePostHogSurvey` hook
- [ ] Track survey responses with proper events
- [ ] Review responses in PostHog dashboard

## Common Patterns

### Feature Flag with Loading State

```tsx
function MyComponent() {
  const isEnabled = useFeatureFlagEnabled("my-feature");

  // undefined means still loading
  if (isEnabled === undefined) {
    return <Skeleton />;
  }

  return isEnabled ? <NewFeature /> : <OldFeature />;
}
```

### Percentage Rollout

In PostHog, set flag to enable for X% of users. Code remains the same:

```tsx
const isEnabled = useFeatureFlagEnabled("gradual-rollout");
```

### User Property Targeting

In PostHog, target by user properties (set via `identifyUser`):

```typescript
// Set user properties
identifyUser(userId, {
  plan: "premium",
  country: "US",
});

// Then in PostHog, target: plan = "premium" AND country = "US"
```

### Group-Based Flags (Multi-Tenant)

```typescript
// Server-side with groups
const isEnabled = await isFeatureFlagEnabled("enterprise-feature", userId, {
  groups: { company: tenantId },
});
```

## Troubleshooting

### Flags Not Loading

1. Verify PostHog is initialized (check console for init log)
2. Check API key is correct
3. Ensure user is identified (flags may target identified users)
4. Call `reloadFeatureFlags()` to force refresh

### Experiment Not Tracking

1. Ensure `useFeatureFlagPayload` is called (sends exposure event)
2. Check PostHog for `$feature_flag_called` events
3. Verify conversion events are being sent
4. Check experiment is not paused in PostHog

### Surveys Not Showing

1. Check survey conditions in PostHog
2. Ensure user matches targeting rules
3. For mobile, verify `PostHogSurveyProvider` is in tree
4. Check survey is active (not paused/ended)
