import { db, user, session, account, verification, jwks } from "@app/database";
import { sendTemplateEmail } from "@app/mailer";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { bearer } from "better-auth/plugins/bearer";
import type {
  BetterAuthRequest,
  SendResetPasswordParams,
  SendVerificationEmailParams,
} from "./types";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

/**
 * Session configuration constants
 * These values implement refresh token rotation behavior via Better Auth's session management
 *
 * Better Auth's session management provides equivalent security to refresh token rotation:
 * 1. Short-lived cookie cache (like access tokens) - 5 minutes
 * 2. Session refresh on updateAge (like refresh tokens) - 1 day
 * 3. Complete session expiration after inactivity - 7 days
 * 4. Fresh session requirement for sensitive operations - 10 minutes
 *
 * @see https://www.better-auth.com/docs/concepts/session-management
 */
export const SESSION_CONFIG = {
  // Session expires after 7 days of inactivity
  EXPIRES_IN: 60 * 60 * 24 * 7, // 7 days in seconds
  // Session is refreshed (rotated) every 24 hours when active
  // This acts like refresh token rotation - old session becomes invalid
  UPDATE_AGE: 60 * 60 * 24, // 1 day in seconds
  // Fresh session required for sensitive operations (password change, etc.)
  FRESH_AGE: 60 * 10, // 10 minutes in seconds
  // Cookie cache settings (reduces database queries)
  COOKIE_CACHE_MAX_AGE: 60 * 5, // 5 minutes in seconds
} as const;

/**
 * JWT configuration constants
 * For services that need stateless JWT tokens (API-to-API, microservices)
 *
 * JWTs are short-lived (15 minutes) and require the refresh flow:
 * 1. Client requests JWT from /api/auth/token endpoint
 * 2. JWT is used for API requests (Authorization: Bearer <token>)
 * 3. When JWT expires, client requests new JWT using session cookie
 *
 * Key rotation happens automatically every 30 days with 7-day grace period.
 *
 * @see https://www.better-auth.com/docs/plugins/jwt
 */
export const JWT_CONFIG = {
  // JWT tokens expire quickly - clients must use refresh flow
  EXPIRATION_TIME: "15m",
  // Key rotation interval (rotate keys every 30 days)
  KEY_ROTATION_INTERVAL: 60 * 60 * 24 * 30, // 30 days
  // Grace period for old keys after rotation
  KEY_GRACE_PERIOD: 60 * 60 * 24 * 7, // 7 days
} as const;

/**
 * Rate limiting configuration
 * Protects against brute force attacks and abuse
 *
 * Default: 100 requests per minute
 * Auth endpoints: 10 requests per minute (sign-in, sign-up)
 * Password reset: 5 requests per minute (extra protection)
 */
export const RATE_LIMIT_CONFIG = {
  WINDOW: 60, // 1 minute window
  MAX_REQUESTS: 100, // 100 requests per window
  // Stricter limits for auth endpoints
  AUTH_MAX_REQUESTS: 10, // 10 auth attempts per window
} as const;

/**
 * Better Auth configuration
 * This config should be imported by the API app to create the auth instance
 *
 * Environment variables required:
 * - BETTER_AUTH_SECRET: Secret key for signing tokens
 * - BETTER_AUTH_URL: Base URL of the API (e.g., http://localhost:3030)
 *
 * To add OAuth providers later, add socialProviders config:
 * ```ts
 * socialProviders: {
 *   google: { clientId: "...", clientSecret: "...", enabled: true },
 * }
 * ```
 */
export function createAuthConfig() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const url = process.env.BETTER_AUTH_URL;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET environment variable is required");
  }

  if (!url) {
    throw new Error("BETTER_AUTH_URL environment variable is required");
  }

  // Default trusted origins for development
  const defaultDevOrigins = [
    // Next.js web app (all possible local addresses)
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://[::1]:3000",
    // Expo mobile app
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    // Expo web
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    // API server itself (for server-side calls)
    "http://localhost:3030",
    "http://127.0.0.1:3030",
  ];

  // Use TRUSTED_ORIGINS from env, or fall back to defaults in development
  const trustedOriginsList = process.env.TRUSTED_ORIGINS
    ? process.env.TRUSTED_ORIGINS.split(",").map((o) => o.trim())
    : process.env.NODE_ENV === "production"
      ? []
      : defaultDevOrigins;

  // Custom trustedOrigins function to handle mobile apps (no Origin header)
  // Must return string[] - include "null" to allow requests without origin
  const trustedOrigins = (request: Request): string[] => {
    const userAgent = request.headers.get("user-agent") || "";
    const origin = request.headers.get("origin");

    // Mobile apps (React Native/Expo) don't send Origin headers
    const isMobileApp =
      userAgent.includes("Expo") ||
      userAgent.includes("React Native") ||
      userAgent.includes("okhttp") ||
      userAgent.includes("CFNetwork");

    if (isMobileApp) {
      // Return list that includes "null" to allow requests without origin
      return [...trustedOriginsList, "null"];
    }

    // In development, allow requests without origin
    if (process.env.NODE_ENV !== "production" && (!origin || origin === "null")) {
      return [...trustedOriginsList, "null"];
    }

    return trustedOriginsList;
  };

  const isProduction = process.env.NODE_ENV === "production";

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user,
        session,
        account,
        verification,
        jwks, // For JWT plugin key storage
      },
    }),
    secret,
    baseURL: url,
    trustedOrigins,

    // =========================================================================
    // SESSION CONFIGURATION - Implements refresh token rotation behavior
    // =========================================================================
    session: {
      // Session expires after 7 days of inactivity
      expiresIn: SESSION_CONFIG.EXPIRES_IN,
      // Session is "rotated" (refreshed) every 24 hours when active
      // This is Better Auth's equivalent of refresh token rotation:
      // - On each request after updateAge, the session token is regenerated
      // - Old session becomes invalid, new session is issued
      // - Prevents replay attacks with stolen session tokens
      updateAge: SESSION_CONFIG.UPDATE_AGE,
      // Require fresh session (created within 10 min) for sensitive operations
      // like password changes, email changes, account deletion
      freshAge: SESSION_CONFIG.FRESH_AGE,
      // Cookie caching reduces database queries while maintaining security
      // Uses signed/encrypted cookies (like JWT access tokens) with short TTL
      cookieCache: {
        enabled: true,
        maxAge: SESSION_CONFIG.COOKIE_CACHE_MAX_AGE,
        // Use JWE (encrypted) strategy in production for maximum security
        // Compact strategy in development for easier debugging
        strategy: isProduction ? "jwe" : "compact",
      },
    },

    // =========================================================================
    // RATE LIMITING - Prevents brute force attacks
    // =========================================================================
    rateLimit: {
      enabled: true,
      window: RATE_LIMIT_CONFIG.WINDOW,
      max: RATE_LIMIT_CONFIG.MAX_REQUESTS,
      // Stricter limits for authentication endpoints
      customRules: {
        "/sign-in/*": {
          window: RATE_LIMIT_CONFIG.WINDOW,
          max: RATE_LIMIT_CONFIG.AUTH_MAX_REQUESTS,
        },
        "/sign-up/*": {
          window: RATE_LIMIT_CONFIG.WINDOW,
          max: RATE_LIMIT_CONFIG.AUTH_MAX_REQUESTS,
        },
        "/forget-password": {
          window: RATE_LIMIT_CONFIG.WINDOW,
          max: 5, // Very strict for password reset
        },
      },
    },

    // =========================================================================
    // ADVANCED SECURITY OPTIONS
    // =========================================================================
    advanced: {
      // Mobile apps (React Native/Expo) don't send Origin headers
      // Disable origin check to allow requests without Origin header
      // The trustedOrigins function above still validates origins when present
      disableOriginCheck: !isProduction,
      // Use secure cookies in production (requires HTTPS)
      useSecureCookies: isProduction,
      // Default cookie attributes for security
      defaultCookieAttributes: {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        path: "/",
      },
    },

    // =========================================================================
    // PLUGINS - JWT and Bearer token support
    // =========================================================================
    plugins: [
      // JWT Plugin - For services that need stateless JWT tokens
      // Use case: API-to-API communication, microservices, third-party integrations
      jwt({
        jwt: {
          // Short-lived JWTs (15 minutes) - clients must refresh
          expirationTime: JWT_CONFIG.EXPIRATION_TIME,
          // Include minimal payload for security
          definePayload: ({ user }) => ({
            sub: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
          }),
          // Use base URL as issuer and audience
          issuer: url,
          audience: url,
        },
        jwks: {
          // Rotate signing keys every 30 days
          rotationInterval: JWT_CONFIG.KEY_ROTATION_INTERVAL,
          // Allow old keys to verify tokens for 7 days after rotation
          gracePeriod: JWT_CONFIG.KEY_GRACE_PERIOD,
        },
      }),
      // Bearer Plugin - For API authentication without cookies
      // Use case: Mobile apps, CLI tools, external API consumers
      bearer({
        // Require signed tokens for enhanced security
        requireSignature: isProduction,
      }),
    ],

    emailVerification: {
      // Only send verification emails in production
      sendOnSignUp: process.env.NODE_ENV === "production",
      sendVerificationEmail: async (
        { user, token }: SendVerificationEmailParams,
        _request?: BetterAuthRequest
      ) => {
        // Construct web app verification URL instead of API URL
        const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const verificationLink = `${webAppUrl}/verify-email?token=${token}`;

        // In development, skip actual email sending to avoid Resend domain verification issues
        if (process.env.NODE_ENV !== "production") {
          // Only log verification link in development for testing
          console.log(`[Auth] Dev verification link for ${user.email}: ${verificationLink}`);
          return;
        }

        try {
          await sendTemplateEmail("authVerifyEmail", {
            to: user.email,
            data: {
              name: user.name,
              verificationLink,
            },
            locale: "en", // TODO: Extract from Accept-Language header or user preference
          });
        } catch (error) {
          // Log error without exposing user email in production
          console.error(`[Auth] Failed to send verification email`);
          throw error;
        }
      },
    },
    emailAndPassword: {
      enabled: true,
      // Skip email verification in development for faster testing
      requireEmailVerification: process.env.NODE_ENV === "production",
      autoSignIn: process.env.NODE_ENV !== "production",
      sendResetPassword: async (
        { user, url }: SendResetPasswordParams,
        _request?: BetterAuthRequest
      ) => {
        try {
          await sendTemplateEmail("authResetPassword", {
            to: user.email,
            data: {
              name: user.name,
              resetLink: url,
              expiresIn: "1 hour",
            },
            locale: "en", // TODO: Extract from Accept-Language header or user preference
          });
        } catch (error) {
          // Log error without exposing user email
          console.error(`[Auth] Failed to send password reset email`);
          throw error;
        }
      },
    },
  });
}

export type AuthConfig = ReturnType<typeof createAuthConfig>;
