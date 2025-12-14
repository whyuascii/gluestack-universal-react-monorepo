import { PostHog } from "posthog-node";

let posthogInstance: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  // Check if PostHog is configured
  const apiKey = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!apiKey) {
    console.warn("PostHog API key not found. Server-side analytics will be disabled.");
    return null;
  }

  if (!posthogInstance) {
    posthogInstance = new PostHog(apiKey, {
      host,
      flushAt: 20, // Flush when 20 events are queued
      flushInterval: 10000, // Flush every 10 seconds
    });

    // Ensure all events are flushed on shutdown
    const gracefulShutdown = async () => {
      if (posthogInstance) {
        await posthogInstance.shutdown();
      }
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  }

  return posthogInstance;
}

/**
 * Helper function to capture an exception with PostHog
 */
export function captureException(
  error: Error,
  context?: {
    distinctId?: string;
    userId?: string;
    properties?: Record<string, string | number | boolean | string[] | null | undefined>;
  }
): void {
  const posthog = getPostHogServer();
  if (!posthog) return;

  const distinctId = context?.distinctId || context?.userId || "anonymous";

  posthog.capture({
    distinctId,
    event: "$exception",
    properties: {
      $exception_type: error.name,
      $exception_message: error.message,
      $exception_stack_trace: error.stack,
      ...context?.properties,
    },
  });
}

/**
 * Helper function to track server-side events
 */
export function trackEvent(
  event: string,
  distinctId: string,
  properties?: Record<string, string | number | boolean | string[] | null | undefined>
): void {
  const posthog = getPostHogServer();
  if (!posthog) return;

  posthog.capture({
    distinctId,
    event,
    properties,
  });
}

/**
 * Helper function to identify a user
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, string | number | boolean | string[] | null | undefined>
): void {
  const posthog = getPostHogServer();
  if (!posthog) return;

  posthog.identify({
    distinctId: userId,
    properties,
  });
}
