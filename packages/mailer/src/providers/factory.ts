/**
 * Mailer Provider Factory
 *
 * Creates and manages the singleton mailer provider instance.
 * Uses dynamic imports for provider implementations to enable tree-shaking.
 *
 * @example
 * // At app startup
 * import { initializeMailerProvider } from "@app/mailer";
 * await initializeMailerProvider();
 *
 * // In application code
 * import { getMailerProvider } from "@app/mailer";
 * const provider = getMailerProvider();
 * await provider.send({ to, subject, html });
 */

import type { MailerProvider, MailerProviderConfig, MailerProviderType } from "./types";

/**
 * Singleton provider instance
 */
let currentProvider: MailerProvider | null = null;

/**
 * Initialization guard to prevent concurrent initialization
 */
let initializing = false;

/**
 * Determine which provider to use based on environment
 *
 * Priority:
 * 1. MAILER_PROVIDER env var explicitly set to "none"
 * 2. RESEND_API_KEY present -> use Resend
 * 3. Default to NoOp (no emails sent)
 */
function getProviderType(): MailerProviderType {
  if (process.env.MAILER_PROVIDER === "none") return "none";
  if (process.env.RESEND_API_KEY) return "resend";
  return "none";
}

/**
 * Initialize the mailer provider
 *
 * Should be called once at application startup.
 * Uses environment variables to determine provider type and configuration.
 *
 * @param config - Optional configuration overrides
 *
 * @example
 * // In apps/api/src/plugins/mailer.ts
 * await initializeMailerProvider();
 *
 * // With custom config
 * await initializeMailerProvider({
 *   from: { name: "Custom App", email: "custom@example.com" },
 * });
 */
export async function initializeMailerProvider(
  config?: Partial<MailerProviderConfig>
): Promise<void> {
  // Guard against concurrent initialization
  if (initializing || currentProvider?.isInitialized()) {
    return;
  }
  initializing = true;

  try {
    const type = getProviderType();

    try {
      switch (type) {
        case "resend": {
          // Dynamic import to avoid loading Resend SDK when not needed
          const { ResendMailerProvider } = await import("./resend");
          currentProvider = new ResendMailerProvider();
          break;
        }
        default: {
          // Dynamic import for consistency and tree-shaking
          const { NoOpMailerProvider } = await import("./noop");
          currentProvider = new NoOpMailerProvider();
        }
      }
    } catch (importError) {
      initializing = false;
      throw new Error(
        `Failed to load mailer provider "${type}": ${importError instanceof Error ? importError.message : String(importError)}`
      );
    }

    await currentProvider!.initialize({
      apiKey: config?.apiKey || process.env.RESEND_API_KEY || "",
      from: config?.from || {
        name: process.env.EMAIL_FROM_NAME || "App",
        email: process.env.EMAIL_FROM_ADDRESS || "noreply@example.com",
      },
      replyTo: config?.replyTo || process.env.EMAIL_REPLY_TO,
    });
  } finally {
    initializing = false;
  }
}

/**
 * Get the current mailer provider instance
 *
 * Returns NoOpMailerProvider if not initialized to avoid crashes.
 * Always call initializeMailerProvider() at app startup for proper behavior.
 *
 * @example
 * const provider = getMailerProvider();
 * const result = await provider.send({
 *   to: "user@example.com",
 *   subject: "Hello",
 *   html: "<p>Welcome!</p>",
 * });
 */
export function getMailerProvider(): MailerProvider {
  if (!currentProvider) {
    // Lazy init with NoOp - sync version using require
    // This is intentional: getMailerProvider must be synchronous for ergonomic API
    console.warn(
      "[Mailer] Provider not initialized. Falling back to NoOpMailerProvider. " +
        "Call initializeMailerProvider() at app startup for proper email delivery."
    );
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NoOpMailerProvider } = require("./noop");
    const provider = new NoOpMailerProvider();
    provider.initialize({
      apiKey: "",
      from: {
        name: process.env.EMAIL_FROM_NAME || "App",
        email: process.env.EMAIL_FROM_ADDRESS || "noreply@example.com",
      },
      replyTo: process.env.EMAIL_REPLY_TO,
    });
    currentProvider = provider;
  }
  // Non-null assertion is safe: either we had a provider or we just created one
  return currentProvider!;
}

/**
 * Check if mailer provider is initialized
 */
export function isMailerProviderInitialized(): boolean {
  return currentProvider?.isInitialized() ?? false;
}

/**
 * Reset the provider (for testing)
 */
export function resetMailerProvider(): void {
  currentProvider = null;
  initializing = false;
}

/**
 * Re-export types for convenience
 */
export type {
  MailerProvider,
  MailerProviderConfig,
  MailerProviderType,
  ProviderSendEmailParams,
  SendEmailResult,
} from "./types";
