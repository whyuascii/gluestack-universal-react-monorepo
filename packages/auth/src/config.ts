import { db, user, session, account, verification } from "@app/database";
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
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendEmailVerificationOnSignUp: true,
      sendResetPassword: async (
        { user, url, token }: SendResetPasswordParams,
        request?: BetterAuthRequest
      ) => {
        // TODO: Replace with actual email service (Resend, Nodemailer, SendGrid, etc.)
        console.log(`[Better Auth] Password reset requested for ${user.email}`);
        console.log(`Reset URL: ${url}`);
        console.log(`Reset token: ${token}`);

        // Example implementation with a real email service:
        // await sendEmail({
        //   to: user.email,
        //   subject: "Reset your password",
        //   html: `
        //     <h2>Reset Your Password</h2>
        //     <p>Click the link below to reset your password:</p>
        //     <a href="${url}">Reset Password</a>
        //     <p>This link will expire in 1 hour.</p>
        //   `,
        // });
      },
      sendVerificationEmail: async (
        { user, url, token }: SendVerificationEmailParams,
        request?: BetterAuthRequest
      ) => {
        // TODO: Replace with actual email service
        console.log(`[Better Auth] Email verification requested for ${user.email}`);
        console.log(`Verification URL: ${url}`);
        console.log(`Verification token: ${token}`);

        // Example implementation:
        // await sendEmail({
        //   to: user.email,
        //   subject: "Verify your email",
        //   html: `
        //     <h2>Verify Your Email</h2>
        //     <p>Click the link below to verify your email address:</p>
        //     <a href="${url}">Verify Email</a>
        //   `,
        // });
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
