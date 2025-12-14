import { type FastifyPluginAsync, type FastifyRequest, type FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { captureException } from "../lib/posthog-server";

/**
 * Fastify plugin to automatically capture errors with PostHog
 */
const posthogErrorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  // Add error handler
  fastify.setErrorHandler(
    (error: Error & { statusCode?: number }, request: FastifyRequest, reply: FastifyReply) => {
      // Extract user information from request
      const distinctId = getUserDistinctId(request);
      const userId = getUserId(request);

      // Capture exception with PostHog
      captureException(error, {
        distinctId: distinctId ?? userId ?? undefined,
        userId: userId ?? undefined,
        properties: {
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode || error.statusCode || 500,
          headers: JSON.stringify(request.headers),
          query: JSON.stringify(request.query),
          ip: request.ip,
          userAgent: request.headers["user-agent"],
        },
      });

      // Log the error
      fastify.log.error(error);

      // Send error response
      const statusCode = error.statusCode || 500;
      reply.status(statusCode).send({
        error: error.name || "Internal Server Error",
        message: error.message || "An unexpected error occurred",
        statusCode,
      });
    }
  );
};

/**
 * Extract PostHog distinct_id from cookies
 */
function getUserDistinctId(request: FastifyRequest): string | null {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) return null;

  // Match PostHog cookie pattern
  const postHogCookieMatch = cookieHeader.match(/ph_phc_.*?_posthog=([^;]+)/);

  if (postHogCookieMatch && postHogCookieMatch[1]) {
    try {
      const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
      const postHogData = JSON.parse(decodedCookie) as { distinct_id?: string };
      return postHogData.distinct_id || null;
    } catch (_e) {
      return null;
    }
  }

  return null;
}

/**
 * Extract user ID from request (customize based on your auth implementation)
 */
function getUserId(request: FastifyRequest): string | null {
  const requestWithUser = request as FastifyRequest & {
    user?: { id?: string };
    session?: { userId?: string };
  };

  // Option 1: From JWT token
  if (
    requestWithUser.user &&
    typeof requestWithUser.user === "object" &&
    "id" in requestWithUser.user
  ) {
    return requestWithUser.user.id || null;
  }

  // Option 2: From session
  if (
    requestWithUser.session &&
    typeof requestWithUser.session === "object" &&
    "userId" in requestWithUser.session
  ) {
    return requestWithUser.session.userId || null;
  }

  return null;
}

export default fp(posthogErrorHandlerPlugin, {
  name: "posthog-error-handler",
});
