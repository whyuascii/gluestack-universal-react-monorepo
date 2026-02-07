/**
 * Novu Configuration
 *
 * Centralizes Novu API keys and configuration for server and client SDKs.
 * Supports:
 * - Push notifications via Expo provider
 * - In-app notifications
 * - Multi-tenant topics
 * - Subscriber management
 */

// crypto is imported dynamically to avoid bundling in React Native

/**
 * Novu Server Configuration Interface
 */
export interface NovuServerConfig {
  secretKey: string;
  appId: string;
  baseUrl?: string; // For EU or self-hosted instances
}

/**
 * Novu Client Configuration Interface
 */
export interface NovuClientConfig {
  applicationIdentifier: string;
  subscriberId: string;
  subscriberHash?: string;
  backendUrl?: string;
}

/**
 * Novu Environment Configuration
 */
export interface NovuEnvironmentConfig {
  environment: "production" | "development";
  region?: "us" | "eu";
}

/**
 * Get Novu Secret Key (server-side only)
 */
export function getNovuSecretKey(): string {
  if (typeof process !== "undefined" && process.env?.NOVU_SECRET_KEY) {
    return process.env.NOVU_SECRET_KEY;
  }
  return "";
}

/**
 * Get Novu App ID for the current platform
 */
export function getNovuAppId(): string {
  // Server
  if (typeof process !== "undefined" && process.env?.NOVU_APP_ID) {
    return process.env.NOVU_APP_ID;
  }

  // Web (Next.js)
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_NOVU_APP_ID) {
    return process.env.NEXT_PUBLIC_NOVU_APP_ID;
  }

  // Mobile (Expo)
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_NOVU_APP_ID) {
    return process.env.EXPO_PUBLIC_NOVU_APP_ID;
  }

  return "";
}

/**
 * Get Novu base URL (for EU or self-hosted instances)
 */
export function getNovuBaseUrl(): string | undefined {
  if (typeof process !== "undefined" && process.env?.NOVU_BASE_URL) {
    return process.env.NOVU_BASE_URL;
  }
  return undefined;
}

/**
 * Get Novu server configuration
 * Use this when initializing the Novu server SDK
 *
 * @example
 * import { Novu } from "@novu/api";
 * const config = getNovuServerConfig();
 * const novu = new Novu({ secretKey: config.secretKey });
 */
export function getNovuServerConfig(): NovuServerConfig {
  return {
    secretKey: getNovuSecretKey(),
    appId: getNovuAppId(),
    baseUrl: getNovuBaseUrl(),
  };
}

/**
 * Get Novu client configuration for React/React Native
 * Use this when initializing the NovuProvider component
 *
 * @param subscriberId - The user's unique ID
 * @param subscriberHash - HMAC hash for secure client authentication (optional, generated if not provided)
 *
 * @example
 * const config = getNovuClientConfig(user.id);
 * <NovuProvider
 *   applicationIdentifier={config.applicationIdentifier}
 *   subscriberId={config.subscriberId}
 *   subscriberHash={config.subscriberHash}
 * >
 */
export function getNovuClientConfig(
  subscriberId: string,
  subscriberHash?: string
): NovuClientConfig {
  const secretKey = getNovuSecretKey();

  return {
    applicationIdentifier: getNovuAppId(),
    subscriberId,
    subscriberHash:
      subscriberHash || (secretKey ? generateSubscriberHash(subscriberId) : undefined),
    backendUrl: getNovuBaseUrl(),
  };
}

/**
 * Generate HMAC hash for subscriber authentication
 *
 * This hash is used to securely authenticate the subscriber on the client side.
 * The client SDK uses this hash to prove that the subscriber ID was issued by your server.
 *
 * NOTE: This function only works on the server (Node.js). Returns empty string on client.
 *
 * @param subscriberId - The user's unique ID
 * @returns HMAC SHA256 hash of the subscriber ID
 *
 * @example
 * // Server-side: Generate hash for client
 * const hash = generateSubscriberHash(user.id);
 *
 * // Client-side: Use hash with NovuProvider
 * <NovuProvider subscriberHash={hash} ... />
 */
export function generateSubscriberHash(subscriberId: string): string {
  const secretKey = getNovuSecretKey();

  if (!secretKey) {
    return "";
  }

  // Only run on server - crypto is not available in React Native
  if (typeof globalThis !== "undefined" && "window" in globalThis) {
    console.warn("[notifications] generateSubscriberHash should only be called on the server");
    return "";
  }

  try {
    // Dynamic require to avoid bundling crypto in React Native
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createHmac } = require("crypto");
    return createHmac("sha256", secretKey).update(subscriberId).digest("hex");
  } catch {
    console.warn("[notifications] crypto not available - generateSubscriberHash requires Node.js");
    return "";
  }
}

/**
 * Check if Novu is configured
 */
export function isNovuConfigured(): boolean {
  return Boolean(getNovuSecretKey() && getNovuAppId());
}

/**
 * Novu notification workflow identifiers
 *
 * These should match the workflow IDs defined in your Novu dashboard
 * or created via the code-first approach.
 */
export const NovuWorkflows = {
  // Push notifications
  PUSH_NOTIFICATION: "push-notification",
  PUSH_NOTIFICATION_BATCHED: "push-notification-batched",

  // In-app notifications
  IN_APP_NOTIFICATION: "in-app-notification",

  // Transactional (reference - actual email goes through Resend)
  WELCOME: "welcome",
  VERIFY_EMAIL: "verify-email",
  RESET_PASSWORD: "reset-password",

  // Social
  INVITE_RECEIVED: "invite-received",
  MEMBER_JOINED: "member-joined",

  // Engagement
  WEEKLY_SUMMARY: "weekly-summary",
  REMINDER: "reminder",
} as const;

/**
 * Novu topic key generator for multi-tenant support
 *
 * Topics are used to broadcast notifications to all members of a tenant.
 *
 * @param tenantId - The tenant's unique ID
 * @returns Topic key string
 *
 * @example
 * const topicKey = getTenantTopicKey(tenant.id);
 * await novu.topics.addSubscribers(topicKey, { subscribers: [userId] });
 */
export function getTenantTopicKey(tenantId: string): string {
  return `tenant_${tenantId}`;
}

/**
 * Novu subscriber data mapper
 *
 * Maps your user object to Novu subscriber format
 */
export interface NovuSubscriberData {
  subscriberId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  locale?: string;
  avatar?: string;
  data?: Record<string, unknown>;
}

/**
 * Create Novu subscriber data from user object
 *
 * @param user - User object with at least an id
 * @returns Novu subscriber data
 */
export function createSubscriberData(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  locale?: string | null;
}): NovuSubscriberData {
  // Split name into first and last
  const nameParts = user.name?.split(" ") || [];
  const firstName = nameParts[0] || undefined;
  const lastName = nameParts.slice(1).join(" ") || undefined;

  return {
    subscriberId: user.id,
    email: user.email || undefined,
    firstName,
    lastName,
    avatar: user.image || undefined,
    locale: user.locale || undefined,
  };
}
