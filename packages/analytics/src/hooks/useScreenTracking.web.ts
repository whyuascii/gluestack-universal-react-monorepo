"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";

/**
 * Hook to automatically track page views with Next.js App Router
 *
 * Add to your root layout.tsx:
 * ```tsx
 * function PageTracker() {
 *   usePageTracking();
 *   return null;
 * }
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <PostHogProvider>
 *           <PageTracker />
 *           {children}
 *         </PostHogProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Build the full URL
    const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    // Track the pageview
    posthog.capture("$pageview", {
      $current_url: typeof window !== "undefined" ? window.location.href : url,
      path: pathname,
      previous_path: previousPathRef.current,
    });

    previousPathRef.current = pathname;
  }, [pathname, searchParams]);
}

/**
 * Track a specific page manually
 * Useful for virtual pages or modals
 */
export function useTrackPage(pageName: string, properties?: Record<string, unknown>) {
  useEffect(() => {
    if (pageName) {
      posthog.capture("$pageview", {
        page_name: pageName,
        ...properties,
      });
    }
  }, [pageName, properties]);
}
