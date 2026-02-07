/**
 * Subscription Provider Registry
 *
 * Central registry for all subscription providers.
 * To add a new provider:
 * 1. Create a new file (e.g., stripe.ts) implementing SubscriptionProvider
 * 2. Add the provider name to ProviderName type in types.ts
 * 3. Import and add to the providers object below
 * 4. Add env var check to isProviderConfigured
 */

import { polarProvider } from "./polar";
import { revenuecatProvider } from "./revenuecat";
import type { SubscriptionProvider, ProviderName } from "./types";

// =============================================================================
// Provider Registry
// =============================================================================

/**
 * All registered subscription providers.
 * Add new providers here.
 */
const providers: Record<ProviderName, SubscriptionProvider> = {
  polar: polarProvider,
  revenuecat: revenuecatProvider,
  // Add new providers here:
  // stripe: stripeProvider,
};

// =============================================================================
// Registry Functions
// =============================================================================

/**
 * Get a provider by name.
 *
 * @param name - Provider name
 * @returns The provider implementation
 * @throws Error if provider not found
 *
 * @example
 * const provider = getProvider("polar");
 * const isValid = provider.verifyWebhook(payload, signature);
 */
export function getProvider(name: ProviderName): SubscriptionProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Unknown subscription provider: ${name}`);
  }
  return provider;
}

/**
 * Get all registered provider names.
 *
 * @returns Array of provider names
 */
export function getProviderNames(): ProviderName[] {
  return Object.keys(providers) as ProviderName[];
}

/**
 * Check if a provider is configured (has required env vars).
 *
 * @param name - Provider name to check
 * @returns true if provider can be used
 *
 * @example
 * if (isProviderConfigured("polar")) {
 *   // Can use Polar for web payments
 * }
 */
export function isProviderConfigured(name: ProviderName): boolean {
  switch (name) {
    case "polar":
      return !!process.env.POLAR_ACCESS_TOKEN;
    case "revenuecat":
      return !!process.env.REVENUECAT_WEBHOOK_SECRET;
    default:
      return false;
  }
}

/**
 * Get all configured providers.
 *
 * @returns Array of configured provider names
 */
export function getConfiguredProviders(): ProviderName[] {
  return getProviderNames().filter(isProviderConfigured);
}

// =============================================================================
// Re-exports
// =============================================================================

export * from "./types";
export { polarProvider } from "./polar";
export { revenuecatProvider, getAppUserIdFromEvent } from "./revenuecat";
