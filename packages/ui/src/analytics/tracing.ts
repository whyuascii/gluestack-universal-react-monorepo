/**
 * Request Tracing Utilities
 *
 * Provides correlation IDs for linking client events with API events.
 */

/**
 * Generate a unique trace ID for request correlation
 */
export function createTraceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * HTTP headers for request tracing
 */
export const TRACE_HEADERS = {
  TRACE_ID: "x-trace-id",
  DISTINCT_ID: "x-posthog-distinct-id",
  SESSION_ID: "x-posthog-session-id",
} as const;

/**
 * Create headers object with trace information
 */
export function createTraceHeaders(
  distinctId: string | undefined,
  sessionId?: string | undefined,
  traceId?: string
): Record<string, string> {
  const headers: Record<string, string> = {
    [TRACE_HEADERS.TRACE_ID]: traceId || createTraceId(),
    [TRACE_HEADERS.DISTINCT_ID]: distinctId || "anonymous",
  };

  if (sessionId) {
    headers[TRACE_HEADERS.SESSION_ID] = sessionId;
  }

  return headers;
}
