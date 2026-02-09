# packages/ads — AdMob (Mobile) + AdSense (Web)

Cross-platform ad monetization, conditionally loaded based on subscription tier.

## Structure

```
src/
├── config/index.ts        # Environment detection, test ad units
├── mobile/
│   ├── AdsProvider.tsx    # SDK initialization (wrap app root)
│   ├── AdBanner.tsx       # Banner ad component
│   ├── useInterstitialAd.ts  # Full-screen ad hook
│   ├── useRewardedAd.ts      # Rewarded video hook
│   └── useAdInspector.ts     # Debug tool
└── web/
    ├── AdSenseScript.tsx  # Load AdSense in <head>
    └── AdBanner.tsx       # Responsive banner + in-article/in-feed
```

## Entry Points

```typescript
// Mobile
import { AdsProvider, AdBanner, useInterstitialAd } from "@app/ads/mobile";

// Web
import { AdSenseScript, AdBanner } from "@app/ads/web";

// Config
import { isAdsEnabled } from "@app/ads/config";
```

## Mobile (AdMob)

```typescript
// Wrap app root
<AdsProvider>{children}</AdsProvider>

// Show banner
<AdBanner size="BANNER" />

// Full-screen ad
const { show, isLoaded } = useInterstitialAd({ autoLoad: true });

// Rewarded ad
const { show, isLoaded } = useRewardedAd({
  onRewarded: (reward) => grantReward(reward),
});
```

## Web (AdSense)

```typescript
// In layout <head>
<AdSenseScript />

// In page
<AdBanner format="auto" />
```

## Environment Variables

**Mobile:** `EXPO_PUBLIC_ADS_ENABLED`, `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_IOS_APP_ID`, plus per-format ad unit IDs

**Web:** `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, `NEXT_PUBLIC_ADSENSE_BANNER_SLOT_ID`

## Subscription Integration

Ads show for free tier only. Gate in screens using entitlements:

```typescript
const { tier } = useEntitlements();
{tier === "free" && <AdBanner />}
```

## Rules

- Components return `null` if ads disabled or IDs missing
- Development mode auto-uses Google test ad units
- GDPR: non-personalized ads by default
- Zero runtime dependencies — peer deps only
- Use `Platform.OS` for platform detection on mobile
