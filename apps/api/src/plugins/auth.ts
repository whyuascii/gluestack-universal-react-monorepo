import { createAuthConfig } from "@app/auth/server";
import { BadRequestError, UnauthorizedError, ForbiddenError, ConflictError } from "@app/errors";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";

/**
 * Map Better Auth error codes to user-friendly messages and appropriate error types
 */
function transformBetterAuthError(code: string, message: string, status: number): never {
  const betterAuthDebug = { betterAuthCode: code, betterAuthMessage: message, status };

  switch (code) {
    case "INVALID_ORIGIN":
      throw new ForbiddenError(
        `Better Auth: Invalid origin - ${message}`,
        { message: "Request from unauthorized origin. Please refresh the page and try again." },
        betterAuthDebug
      );

    case "INVALID_EMAIL":
    case "INVALID_PASSWORD":
      throw new BadRequestError(
        `Better Auth: ${code} - ${message}`,
        { message: "Please enter a valid email address and password." },
        betterAuthDebug
      );

    case "INVALID_CREDENTIALS":
    case "CREDENTIALS_INVALID":
      throw new UnauthorizedError(
        `Better Auth: Invalid credentials - ${message}`,
        { message: "Invalid email or password. Please try again." },
        betterAuthDebug
      );

    case "USER_ALREADY_EXISTS":
    case "EMAIL_ALREADY_IN_USE":
    case "DUPLICATE_EMAIL":
      throw new ConflictError(
        `Better Auth: User already exists - ${message}`,
        { message: "An account with this email already exists. Please log in instead." },
        betterAuthDebug
      );

    case "WEAK_PASSWORD":
    case "PASSWORD_TOO_SHORT":
      throw new BadRequestError(
        `Better Auth: Weak password - ${message}`,
        { message: "Password must be at least 8 characters long." },
        betterAuthDebug
      );

    case "SESSION_EXPIRED":
    case "SESSION_NOT_FOUND":
    case "INVALID_SESSION":
      throw new UnauthorizedError(
        `Better Auth: Session error - ${message}`,
        { message: "Your session has expired. Please log in again." },
        betterAuthDebug
      );

    case "UNAUTHORIZED":
      throw new UnauthorizedError(
        `Better Auth: Unauthorized - ${message}`,
        { message: "You are not authorized to perform this action." },
        betterAuthDebug
      );

    default:
      // Generic error - provide a safe message to the user
      throw new BadRequestError(
        `Better Auth: ${code} - ${message}`,
        {
          message: message || "Unable to complete authentication. Please try again.",
          details: ["If this problem persists, please contact support."],
        },
        betterAuthDebug
      );
  }
}

/**
 * Auth plugin that:
 * 1. Initializes Better Auth with database connection
 * 2. Mounts Better Auth handler at /api/auth/*
 * 3. Decorates Fastify instance with betterAuth instance
 * 4. Provides authentication verification preHandler (verifyAuth)
 */
export default fastifyPlugin(
  async (fastify: FastifyInstance) => {
    try {
      // Create Better Auth instance
      const betterAuth = createAuthConfig();

      // Decorate fastify instance with betterAuth
      fastify.decorate("betterAuth", betterAuth);

      // Mount Better Auth handler at /api/auth/*
      fastify.all("/api/auth/*", async (request, reply) => {
        // Convert Fastify request to Web Request
        const url = new URL(request.url, `${request.protocol}://${request.hostname}`);

        const webRequest = new Request(url, {
          method: request.method,
          headers: request.headers as Record<string, string>,
          body:
            request.method !== "GET" && request.method !== "HEAD"
              ? JSON.stringify(request.body)
              : undefined,
        });

        // Call Better Auth handler
        const response = await betterAuth.handler(webRequest);

        // Set response status and headers first
        reply.status(response.status);
        response.headers.forEach((value: string, key: string) => {
          reply.header(key, value);
        });

        // Get the response body (can only read once!)
        const body = await response.text();

        // Check if Better Auth returned an error response
        if (response.status >= 400) {
          let errorData: Record<string, unknown> = {};

          try {
            errorData = JSON.parse(body) as Record<string, unknown>;
          } catch {
            // If body is not JSON, use raw text
            errorData = { message: body || "Authentication error occurred" };
          }

          // Extract error details
          const code = (errorData.code as string) || "AUTH_ERROR";
          const message = (errorData.message as string) || "Authentication error occurred";

          // Transform to appropriate AppCustomError with user-friendly message
          transformBetterAuthError(code, message, response.status);
        }

        // Send successful response
        return reply.send(body);
      });

      // Decorate with verifyAuth method for protecting routes
      fastify.decorate("verifyAuth", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          // Get session from Better Auth
          const session = await betterAuth.api.getSession({
            headers: request.headers,
          });

          if (!session) {
            return reply.status(401).send({
              message: "Unauthorized - No valid session",
              code: "UNAUTHORIZED",
            });
          }

          // Attach session to request for use in handlers
          request.session = session.session;
          request.user = session.user;
        } catch (error) {
          fastify.log.error({ message: "Authentication error", error });
          return reply.status(401).send({
            message: "Unauthorized - Invalid session",
            code: "UNAUTHORIZED",
          });
        }
      });

      fastify.log.info("Better Auth initialized and mounted at /api/auth/*");
    } catch (err) {
      fastify.log.error({ message: "Failed to initialize Better Auth", error: err });
      throw err;
    }
  },
  { name: "betterAuth", dependencies: ["config", "database"] }
);
