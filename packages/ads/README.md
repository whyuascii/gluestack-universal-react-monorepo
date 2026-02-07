# @app/ads

Cross-platform advertising package for mobile (Google AdMob) and web (Google AdSense).

## Quick Start

### Mobile (Expo/React Native)

```tsx
// In _layout.tsx
import { AdsProvider } from "@app/ads/mobile";

export default function Layout() {
  return (
    <AdsProvider>
      <Slot />
    </AdsProvider>
  );
}

// In your screen
import { AdBanner } from "@app/ads/mobile";

function MyScreen() {
  return (
    <View>
      <AdBanner size="BANNER" />
    </View>
  );
}
```

### Web (Next.js)

```tsx
// In layout.tsx <head>
import { AdSenseScript } from "@app/ads/web";

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <AdSenseScript />
      </head>
      <body>{children}</body>
    </html>
  );
}

// In your page
import { AdBanner } from "@app/ads/web";

function MyPage() {
  return <AdBanner format="auto" />;
}
```

## Environment Variables

```bash
# Enable/disable per app
EXPO_PUBLIC_ADS_ENABLED=false   # Mobile
NEXT_PUBLIC_ADS_ENABLED=false   # Web

# Mobile AdMob IDs
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-xxx~yyy
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-xxx~yyy
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID=ca-app-pub-xxx/yyy
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=ca-app-pub-xxx/yyy
EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID=ca-app-pub-xxx/yyy
EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID=ca-app-pub-xxx/yyy
EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID=ca-app-pub-xxx/yyy
EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID=ca-app-pub-xxx/yyy

# Test device IDs (comma-separated)
EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS=ABC123,DEF456

# Web AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxx
NEXT_PUBLIC_ADSENSE_BANNER_SLOT_ID=1234567890
```

## Google AdMob Recommendations

### 1. sellers.json (RECOMMENDED)

**What:** Allow advertisers to verify your ad inventory by making your seller information transparent.

**Why:** Increases ad revenue and fill rates from premium advertisers.

**How to enable:**

1. Go to [AdMob Console](https://admob.google.com)
2. Navigate to **Settings > Account information**
3. Under "Seller information visibility", select **"Transparent"**
4. Fill in your legal business name and domain
5. Save changes

[Learn more about sellers.json](https://support.google.com/admob/answer/9523881)

### 2. Ad Inspector (RECOMMENDED)

**What:** Debug tool to test your ad integration and verify test device registration.

**Usage:**

```tsx
import { useAdInspector } from "@app/ads/mobile";

function DebugScreen() {
  const { openAdInspector, isAvailable, error } = useAdInspector();

  return (
    <Button onPress={openAdInspector} disabled={!isAvailable}>
      Open Ad Inspector
    </Button>
  );
}
```

**Requirements:**

- Ads must be enabled (`EXPO_PUBLIC_ADS_ENABLED=true`)
- Test device must be registered
- SDK must be initialized

[Learn more about Ad Inspector](https://developers.google.com/admob/android/ad-inspector)

### 3. Test Device Registration (REQUIRED for testing)

**Why:** Testing with real ads violates AdMob policies. Always use test devices during development.

**How to find your device ID:**

1. Run your app with ads enabled
2. Check the console logs for a message like:
   ```
   Use RequestConfiguration.Builder.setTestDeviceIds(["YOUR_DEVICE_ID"])
   ```
3. Copy the device ID
4. Add to your `.env`:
   ```
   EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS=YOUR_DEVICE_ID
   ```
5. Restart the app

### 4. app-ads.txt (For Web)

**What:** A file that verifies your ad inventory ownership.

**How to set up:**

1. Create a file at `https://yourdomain.com/app-ads.txt`
2. Add your AdSense publisher ID:
   ```
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```

You can generate this content programmatically:

```tsx
import { getAppAdsTxtContent } from "@app/ads/config";

const content = getAppAdsTxtContent("pub-1234567890123456");
// Returns: "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0"
```

## API Reference

### Mobile

| Export                 | Description                           |
| ---------------------- | ------------------------------------- |
| `AdsProvider`          | Wrap your app to initialize the SDK   |
| `useAdsContext()`      | Access ads initialization state       |
| `AdBanner`             | Display banner ad                     |
| `useInterstitialAd()`  | Hook for full-screen interstitial ads |
| `useRewardedAd()`      | Hook for rewarded video ads           |
| `useAdInspector()`     | Hook to open Ad Inspector             |
| `isMobileAdsEnabled()` | Check if mobile ads are enabled       |
| `getTestDeviceIds()`   | Get registered test device IDs        |

### Web

| Export              | Description                     |
| ------------------- | ------------------------------- |
| `AdSenseScript`     | Load AdSense script in `<head>` |
| `AdBanner`          | Display standard banner ad      |
| `AdInArticle`       | In-article ad format            |
| `AdInFeed`          | In-feed ad format               |
| `isWebAdsEnabled()` | Check if web ads are enabled    |

### Config

| Export                  | Description                             |
| ----------------------- | --------------------------------------- |
| `isAdsEnabled()`        | Check if ads are enabled (any platform) |
| `TEST_AD_UNITS`         | Google's official test ad unit IDs      |
| `SELLERS_JSON_GUIDE`    | Steps to configure sellers.json         |
| `getAppAdsTxtContent()` | Generate app-ads.txt content            |

## Banner Sizes (Mobile)

| Size               | Dimensions | Usage              |
| ------------------ | ---------- | ------------------ |
| `BANNER`           | 320x50     | Standard banner    |
| `LARGE_BANNER`     | 320x100    | Large banner       |
| `MEDIUM_RECTANGLE` | 300x250    | Inline content     |
| `FULL_BANNER`      | 468x60     | Tablet banner      |
| `LEADERBOARD`      | 728x90     | Tablet leaderboard |
| `ADAPTIVE_BANNER`  | Varies     | Responsive width   |

## Development vs Production

In development (`NODE_ENV !== "production"`), the package automatically uses Google's test ad unit IDs. This ensures:

- No policy violations during development
- Consistent test ads for debugging
- No accidental clicks on real ads

In production, it uses your configured ad unit IDs from environment variables.
