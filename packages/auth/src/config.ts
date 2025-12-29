import { db, user, session, account, verification } from "@app/database";
import { transactionalNotificationService } from "@app/notifications";
import type {
  BetterAuthRequest,
  SendResetPasswordParams,
  SendVerificationEmailParams,
} from "@app/service-contracts";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

/**
 * Better Auth configuration
 * This config should be imported by the API app to create the auth instance
 *
 * Environment variables required:
 * - BETTER_AUTH_SECRET: Secret key for signing tokens
 * - BETTER_AUTH_URL: Base URL of the API (e.g., http://localhost:3000)
 * - GOOGLE_CLIENT_ID: Google OAuth client ID
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret
 * - GITHUB_CLIENT_ID: GitHub OAuth client ID
 * - GITHUB_CLIENT_SECRET: GitHub OAuth client secret
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

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    secret,
    baseURL: url,
    trustedOrigins:
      process.env.NODE_ENV === "production"
        ? process.env.TRUSTED_ORIGINS?.split(",") || []
        : [
            "http://localhost:3000", // Next.js web app
            "http://localhost:8081", // Expo mobile app
            "http://localhost:19006", // Expo web
          ],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendEmailVerificationOnSignUp: true,
      sendResetPassword: async (
        { user, url, token }: SendResetPasswordParams,
        _request?: BetterAuthRequest
      ) => {
        try {
          // Send password reset notification via transactional notification service
          await transactionalNotificationService.sendPasswordReset(user.email, token);
          console.log(`[Better Auth] Password reset email sent to ${user.email}`);
        } catch (error) {
          console.error(`[Better Auth] Failed to send password reset email:`, error);
          throw error;
        }
      },
      sendVerificationEmail: async (
        { user, url, token }: SendVerificationEmailParams,
        _request?: BetterAuthRequest
      ) => {
        try {
          // Send email verification notification via transactional notification service
          await transactionalNotificationService.sendEmailVerification(user.email, token);
          console.log(`[Better Auth] Verification email sent to ${user.email}`);
        } catch (error) {
          console.error(`[Better Auth] Failed to send verification email:`, error);
          throw error;
        }
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      },
    },
  });
}

export type AuthConfig = ReturnType<typeof createAuthConfig>;
