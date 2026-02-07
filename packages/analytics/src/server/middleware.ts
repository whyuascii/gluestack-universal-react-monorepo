/**
 * Analytics Middleware for Fastify
 *
 * Extracts trace headers from requests and attaches analytics context.
 * Headers:
 *   - x-trace-id: Correlation ID for request tracing
 *   - x-posthog-distinct-id: PostHog distinct ID for user linking
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { ServerAnalyticsContext } from "./types";

// Extend Fastify request type
declare module "fastify" {
  interface FastifyRequest {
    analyticsContext: ServerAnalyticsContext;
  }
}

// Header names
export const TRACE_ID_HEADER = "x-trace-id";
export const DISTINCT_ID_HEADER = "x-posthog-distinct-id";
export const SESSION_ID_HEADER = "x-posthog-session-id";

/**
 * Generate a simple trace ID (fallback if not provided by client)
 */
function generateTraceId(): string {
  return `srv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract analytics context from request headers
 */
export function extractAnalyticsContext(request: FastifyRequest): ServerAnalyticsContext {
  const traceId = (request.headers[TRACE_ID_HEADER] as string) || generateTraceId();
  const distinctId = (request.headers[DISTINCT_ID_HEADER] as string) || "anonymous";
  const sessionId = request.headers[SESSION_ID_HEADER] as string | undefined;

  return {
    traceId,
    distinctId,
    sessionId,
    timestamp: Date.now(),
  };
}

/**
 * Fastify plugin to add analytics context to requests
 */
export async function analyticsMiddleware(fastify: FastifyInstance): Promise<void> {
  // Use a getter to provide the initial value for the decorator
  fastify.decorateRequest("analyticsContext", {
    getter() {
      return {
        traceId: generateTraceId(),
        distinctId: "anonymous",
        timestamp: Date.now(),
      };
    },
  });

  fastify.addHook("onRequest", async (request: FastifyRequest, _reply: FastifyReply) => {
    request.analyticsContext = extractAnalyticsContext(request);
  });

  // Optionally add trace ID to response headers for debugging
  fastify.addHook("onSend", async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.analyticsContext?.traceId) {
      reply.header(TRACE_ID_HEADER, request.analyticsContext.traceId);
    }
  });
}

/**
 * Helper to get analytics context from request
 */
export function getRequestContext(request: FastifyRequest): ServerAnalyticsContext {
  return (
    request.analyticsContext || {
      traceId: generateTraceId(),
      distinctId: "anonymous",
      sessionId: undefined,
      timestamp: Date.now(),
    }
  );
}
