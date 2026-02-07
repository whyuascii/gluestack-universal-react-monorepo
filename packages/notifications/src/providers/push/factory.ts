/**
 * Push Provider Factory
 *
 * Creates and manages the singleton push provider instance.
 * Uses feature flag to determine which provider to use.
 */

import type { PushProvider, PushProviderConfig, PushProviderType } from "./types";
import { NoOpPushProvider } from "./noop";

/**
 * Singleton provider instance
 */
let currentProvider: PushProvider | null = null;

/**
 * Get the notification provider type from environment
 */
export function getProviderType(): PushProviderType {
  const envProvider = process.env.NOTIFICATION_PROVIDER;

  if (envProvider && ["novu", "none"].includes(envProvider)) {
    return envProvider as PushProviderType;
  }

  // Default: check for Novu configuration
  if (process.env.NOVU_SECRET_KEY) {
    return "novu";
  }

  // No provider configured
  return "none";
}

/**
 * Create a push provider instance based on type
 */
async function createProvider(type: PushProviderType): Promise<PushProvider> {
  switch (type) {
    case "novu": {
      // Dynamic import to avoid loading Novu SDK when not needed
      const { NovuPushProvider } = await import("./novu");
      return new NovuPushProvider();
    }
    case "none":
    default:
      return new NoOpPushProvider();
  }
}

/**
 * Get provider configuration based on type
 */
function getProviderConfig(type: PushProviderType): PushProviderConfig {
  switch (type) {
    case "novu":
      return {
        apiKey: process.env.NOVU_SECRET_KEY || "",
        appId: process.env.NOVU_APP_ID || "",
        environment: process.env.NODE_ENV === "production" ? "production" : "development",
        baseUrl: process.env.NOVU_BASE_URL, // Optional for EU/self-hosted
      };
    case "none":
    default:
      return {
        apiKey: "",
        appId: "",
        environment: "development",
      };
  }
}

/**
 * Initialize the push provider
 *
 * Should be called once at server startup.
 * Uses environment variable NOTIFICATION_PROVIDER to determine provider.
 *
 * @example
 * // In apps/api/src/index.ts
 * import { initializePushProvider } from "@app/notifications/server";
 * await initializePushProvider();
 */
export async function initializePushProvider(
  overrideType?: PushProviderType
): Promise<PushProvider> {
  const type = overrideType || getProviderType();
  const config = getProviderConfig(type);

  const provider = await createProvider(type);
  await provider.initialize(config);

  currentProvider = provider;

  return provider;
}

/**
 * Get the current push provider instance
 *
 * Returns NoOpPushProvider if not initialized to avoid crashes.
 * Always call initializePushProvider() at app startup.
 *
 * @example
 * const provider = getPushProvider();
 * await provider.sendPush({ userId, title, body });
 */
export function getPushProvider(): PushProvider {
  if (!currentProvider) {
    // Not initialized - use NoOp provider silently
    currentProvider = new NoOpPushProvider();
  }
  return currentProvider;
}

/**
 * Check if push provider is initialized
 */
export function isPushProviderInitialized(): boolean {
  return currentProvider?.isInitialized() ?? false;
}

/**
 * Reset the provider (for testing)
 */
export function resetPushProvider(): void {
  currentProvider = null;
}

/**
 * Re-export types for convenience
 */
export type {
  PushProvider,
  PushProviderConfig,
  PushProviderType,
  SubscriberInfo,
  PushCredentials,
  SendPushParams,
  SendPushResult,
} from "./types";
