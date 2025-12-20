import PostHog from "posthog-react-native";
import type { Analytics } from "../types";

class PostHogMobile implements Analytics {
  private client: PostHog | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
    const apiHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (!apiKey) {
      console.warn("PostHog API key not found. Analytics will be disabled.");
      return;
    }

    this.client = new PostHog(apiKey, {
      host: apiHost,
      // Enable automatic error tracking
      enableSessionReplay: false, // Can enable if using session replay
      captureNativeAppLifecycleEvents: true,
    });

    // Set up global error handlers
    this.setupErrorHandlers();

    this.initialized = true;
  }

  private setupErrorHandlers(): void {
    // Capture unhandled promise rejections
    if (typeof global !== "undefined") {
      const _originalHandler = global.Promise?.prototype.catch;

      // Track unhandled rejections
      if (typeof ErrorUtils !== "undefined") {
        const originalErrorHandler = ErrorUtils.getGlobalHandler();

        ErrorUtils.setGlobalHandler((error, isFatal) => {
          if (this.client) {
            this.client.capture("$exception", {
              $exception_type: error.name || "Error",
              $exception_message: error.message,
              $exception_stack_trace: error.stack ?? "",
              $exception_is_fatal: isFatal ?? false,
              $exception_source: "react-native-error-handler",
            });
          }

          // Call original handler
          if (originalErrorHandler) {
            originalErrorHandler(error, isFatal);
          }
        });
      }
    }
  }

  track(event: string, properties?: Record<string, any>): void {
    if (!this.client) return;
    this.client.capture(event, properties);
  }

  identify(userId: string, properties?: Record<string, any>): void {
    if (!this.client) return;
    this.client.identify(userId, properties);
  }

  reset(): void {
    if (!this.client) return;
    this.client.reset();
  }

  capture(event: string, properties?: Record<string, any>): void {
    this.track(event, properties);
  }

  getClient(): PostHog | null {
    return this.client;
  }
}

export const analytics = new PostHogMobile();
