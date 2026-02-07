/**
 * AdBanner Component (Web)
 *
 * Displays a banner ad using Google AdSense.
 * Automatically handles responsive sizing.
 */

"use client";

import React, { useEffect, useRef } from "react";
import { getWebAdConfig } from "../config";

interface AdBannerProps {
  /** Ad slot ID */
  slot?: string;
  /** Ad format - 'auto' for responsive */
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  /** Whether to use full-width responsive */
  fullWidthResponsive?: boolean;
  /** Custom container style */
  style?: React.CSSProperties;
  /** Custom container className */
  className?: string;
}

/**
 * Web Banner Ad Component (AdSense)
 *
 * Usage:
 * ```tsx
 * import { AdBanner } from "@app/ads/web";
 *
 * <AdBanner format="auto" fullWidthResponsive />
 * ```
 *
 * Note: Requires AdSense script to be loaded in the page head.
 * Add this to your layout:
 * ```tsx
 * <Script
 *   src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
 *   strategy="afterInteractive"
 *   data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
 * />
 * ```
 */
export function AdBanner({
  slot,
  format = "auto",
  fullWidthResponsive = true,
  style,
  className,
}: AdBannerProps) {
  const config = getWebAdConfig();
  const adRef = useRef<HTMLModElement>(null);
  const isLoadedRef = useRef(false);

  const adSlot = slot || config.bannerSlotId;
  const shouldRender = config.enabled && adSlot && config.clientId;

  useEffect(() => {
    // Only push once, and only if we should render
    if (isLoadedRef.current || !shouldRender) return;

    try {
      // Check if adsbygoogle is loaded
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (typeof window !== "undefined" && win.adsbygoogle) {
        win.adsbygoogle.push({});
        isLoadedRef.current = true;
      }
    } catch {
      // AdSense not loaded
    }
  }, [shouldRender]);

  // Don't render if ads are disabled or no slot configured
  if (!shouldRender) {
    return null;
  }

  return (
    <div className={className} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          textAlign: "center",
        }}
        data-ad-client={config.clientId}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}

/**
 * In-Article Ad Component
 *
 * Special format for ads within article content.
 */
export function AdInArticle({
  slot,
  style,
  className,
}: Omit<AdBannerProps, "format" | "fullWidthResponsive">) {
  return (
    <AdBanner
      slot={slot}
      format="fluid"
      fullWidthResponsive={false}
      style={style}
      className={className}
    />
  );
}

/**
 * In-Feed Ad Component
 *
 * Special format for ads within feed/list content.
 */
export function AdInFeed({
  slot,
  style,
  className,
}: Omit<AdBannerProps, "format" | "fullWidthResponsive">) {
  return (
    <AdBanner
      slot={slot}
      format="fluid"
      fullWidthResponsive={false}
      style={style}
      className={className}
    />
  );
}
