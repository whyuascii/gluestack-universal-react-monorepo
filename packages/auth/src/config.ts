import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, user, session, account, verification } from "database";

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
      requireEmailVerification: true,
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
