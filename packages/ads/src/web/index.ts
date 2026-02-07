/**
 * Web Ads Module
 *
 * Export all web ad components.
 *
 * Usage:
 * ```tsx
 * import { AdSenseScript, AdBanner } from "@app/ads/web";
 * ```
 */

export { AdSenseScript, useWebAdsEnabled } from "./AdSenseScript";
export { AdBanner, AdInArticle, AdInFeed } from "./AdBanner";
export { isWebAdsEnabled, getWebAdConfig } from "../config";
