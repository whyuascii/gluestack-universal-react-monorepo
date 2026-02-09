---
name: feature-flags
description: Use when adding feature flags, A/B tests (experiments), or surveys. Handles PostHog feature flag setup across web, mobile, and API with proper tracking for experiments.
---

# Feature Flags & Experiments

Implement feature flags, A/B tests, and surveys using PostHog.

## Quick Reference

| Platform   | Import                  | Flags                   | Experiments                | Surveys                 |
| ---------- | ----------------------- | ----------------------- | -------------------------- | ----------------------- |
| **Web**    | `@app/analytics/web`    | `useFeatureFlagEnabled` | `useFeatureFlagVariantKey` | `usePostHogSurvey`      |
| **Mobile** | `@app/analytics/mobile` | `useFeatureFlagEnabled` | `useFeatureFlagVariantKey` | `PostHogSurveyProvider` |
| **API**    | `@app/analytics/server` | `isFeatureFlagEnabled`  | `getFeatureFlag`           | N/A                     |

## Feature Flags

```tsx
// Web/Mobile — hook-based
const isEnabled = useFeatureFlagEnabled("new-dashboard");
if (isEnabled === undefined) return <Skeleton />; // loading
return isEnabled ? <NewDashboard /> : <OldDashboard />;

// Or use component (auto-tracks exposure)
<PostHogFeature flag="new-feature" match={true}>
  <NewFeature />
</PostHogFeature>;

// Server-side
const enabled = await isFeatureFlagEnabled("beta-features", userId);
```

## A/B Tests (Experiments)

1. Create experiment in PostHog (Experiments → New, define variants + goal metrics)
2. Implement variant logic:

```tsx
const variant = useFeatureFlagVariantKey("checkout-experiment");
const payload = useFeatureFlagPayload("checkout-experiment"); // MUST include for tracking

switch (variant) {
  case "test-a":
    return <CheckoutA />;
  case "test-b":
    return <CheckoutB />;
  default:
    return <CheckoutControl />;
}
```

3. Track conversion: `trackEvent("checkout_completed", { value: orderTotal })`

## Surveys

**Web:** Popover surveys display automatically. For custom UI: `usePostHogSurvey()` hook.

**Mobile:** Add `<PostHogSurveyProvider>` to root layout. Popover surveys auto-display.

## Server-Side Bootstrapping

For instant availability on page load:

```typescript
const flags = await getAllFeatureFlags(userId);
// Pass to PostHog initialization as bootstrap
```

## Environment Variables

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
EXPO_PUBLIC_POSTHOG_KEY=phc_your_key
POSTHOG_KEY=phc_your_key  # Server-side
```

## Checklists

**Adding a feature flag:**

- [ ] Created in PostHog with targeting rules
- [ ] Implemented check in code (web/mobile/API)
- [ ] Fallback behavior for when flag is off
- [ ] Tested both enabled and disabled states

**Running an experiment:**

- [ ] Hypothesis and success metrics defined
- [ ] Variants implemented with `useFeatureFlagVariantKey`
- [ ] `useFeatureFlagPayload` included for tracking
- [ ] Conversion events tracked
- [ ] Monitor until statistical significance

**Adding a survey:**

- [ ] Created in PostHog with conditions
- [ ] Mobile: `PostHogSurveyProvider` in layout
- [ ] Custom UI: `usePostHogSurvey` hook

## Troubleshooting

- **Flags not loading:** Check PostHog init, API key, user identification. Force refresh with `reloadFeatureFlags()`.
- **Experiment not tracking:** Ensure `useFeatureFlagPayload` is called. Check for `$feature_flag_called` events.
- **Surveys not showing:** Verify conditions, targeting, and that provider is in component tree.
