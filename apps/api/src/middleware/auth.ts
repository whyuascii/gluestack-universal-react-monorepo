import { createAuthConfig } from "@app/auth/server";
import { ORPCError, os } from "@orpc/server";
import type { IncomingHttpHeaders } from "http";

// Create Better Auth instance for session validation
const betterAuth = createAuthConfig();

/**
 * Context provided after authentication
 */
export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    activeTenantId?: string | null;
    preferredLanguage?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

/**
 * Base context with headers from Fastify request
 */
export interface BaseContext {
  headers: IncomingHttpHeaders;
}

/**
 * Convert Fastify IncomingHttpHeaders to Web Headers
 */
function toWebHeaders(incomingHeaders: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(incomingHeaders)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }
  return headers;
}

/**
 * Auth middleware - validates session via Better Auth
 */
export const authMiddleware = os.middleware(async ({ context, next }) => {
  const ctx = context as BaseContext;

  // Convert Fastify headers to Web Headers for Better Auth
  const webHeaders = toWebHeaders(ctx.headers);

  const sessionData = await betterAuth.api.getSession({
    headers: webHeaders,
  });

  if (!sessionData?.session || !sessionData?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Not authenticated",
    });
  }

  return next({
    context: {
      user: sessionData.user,
      session: sessionData.session,
    } satisfies AuthContext,
  });
});

/**
 * Optional auth context - user may or may not be authenticated
 */
export interface OptionalAuthContext {
  user?: AuthContext["user"];
  session?: AuthContext["session"];
}

/**
 * Optional auth middleware - allows unauthenticated requests but populates user if available
 */
export const optionalAuthMiddleware = os.middleware(async ({ context, next }) => {
  const ctx = context as BaseContext;

  // Convert Fastify headers to Web Headers for Better Auth
  const webHeaders = toWebHeaders(ctx.headers);

  const sessionData = await betterAuth.api.getSession({
    headers: webHeaders,
  });

  // Don't throw if not authenticated, just pass undefined
  return next({
    context: {
      user: sessionData?.user,
      session: sessionData?.session,
    } satisfies OptionalAuthContext,
  });
});
