/**
 * AdSense Script Component
 *
 * Loads the Google AdSense script in Next.js.
 * Add this to your root layout.
 */

"use client";

import React from "react";
import { getWebAdConfig } from "../config";

/**
 * AdSense Script Loader
 *
 * Loads the AdSense script if ads are enabled.
 * Use this in your root layout:
 *
 * ```tsx
 * // app/layout.tsx
 * import { AdSenseScript } from "@app/ads/web";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <AdSenseScript />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AdSenseScript() {
  const config = getWebAdConfig();

  // Don't load if ads are disabled or no client ID
  if (!config.enabled || !config.clientId) {
    return null;
  }

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.clientId}`}
      crossOrigin="anonymous"
    />
  );
}

/**
 * Hook to check if web ads are enabled
 */
export function useWebAdsEnabled(): boolean {
  const config = getWebAdConfig();
  return config.enabled && Boolean(config.clientId);
}
