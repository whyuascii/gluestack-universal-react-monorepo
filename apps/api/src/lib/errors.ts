import { AuthError } from "@app/auth";
import { ORPCError } from "@orpc/server";
import { trackServerEvent, type ServerAnalyticsContext } from "@app/analytics/server";
import { getAppLogger } from "../utils/logging-handling";

// =============================================================================
// Types
// =============================================================================

export type ErrorSeverity = "fatal" | "error" | "warning" | "info";

export interface ErrorContext {
  /** Source of the error (rpc procedure name or http route) */
  source?: string;
  /** User ID if authenticated */
  userId?: string;
  /** Tenant ID for multi-tenant context */
  tenantId?: string;
  /** HTTP method */
  method?: string;
  /** Request URL/path */
  url?: string;
  /** HTTP status code */
  statusCode?: number;
  /** Request IP address */
  ip?: string;
  /** User agent */
  userAgent?: string;
  /** Analytics context (trace ID, distinct ID, session ID) */
  analyticsContext?: ServerAnalyticsContext;
  /** Additional context */
  extra?: Record<string, unknown>;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: string[];
}

interface NormalizedError {
  name: string;
  message: string;
  code: string;
  statusCode: number;
  stack?: string;
  userResponse: ErrorResponse;
  debug?: Record<string, unknown>;
}

// =============================================================================
// Safe JSON Serialization (handles circular refs, BigInt, etc.)
// =============================================================================

function safeStringify(obj: unknown, maxDepth = 10): string {
  const seen = new WeakSet();

  function serialize(value: unknown, depth: number): unknown {
    if (depth > maxDepth) return "[Max Depth Exceeded]";

    if (value === null || value === undefined) return value;
    if (typeof value === "bigint") return value.toString();
    if (typeof value === "function") return "[Function]";
    if (typeof value === "symbol") return value.toString();

    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
        ...(value instanceof AuthError && { debug: value.debug }),
      };
    }

    if (typeof value === "object") {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);

      if (Array.isArray(value)) {
        return value.map((item) => serialize(item, depth + 1));
      }

      if (value instanceof Date) return value.toISOString();
      if (value instanceof RegExp) return value.toString();
      if (value instanceof Map) return Object.fromEntries(value);
      if (value instanceof Set) return Array.from(value);

      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = serialize(val, depth + 1);
      }
      return result;
    }

    return value;
  }

  return JSON.stringify(serialize(obj, 0), null, 2);
}

// =============================================================================
// Error Normalization
// =============================================================================

function normalizeError(error: unknown): NormalizedError {
  // oRPC errors
  if (error instanceof ORPCError) {
    return {
      name: "ORPCError",
      message: error.message,
      code: error.code,
      statusCode: getStatusFromORPCCode(error.code),
      stack: error.stack,
      userResponse: {
        message: error.message,
        code: error.code,
      },
    };
  }

  // AuthError (from @app/auth)
  if (error instanceof AuthError) {
    return {
      name: error.name,
      message: error.message,
      code: error.name,
      statusCode: error.statusCode,
      stack: error.stack,
      userResponse: error.userResponse,
      debug: error.debug,
    };
  }

  // Standard Error
  if (error instanceof Error) {
    const statusCode = (error as Error & { statusCode?: number }).statusCode || 500;
    return {
      name: error.name,
      message: error.message,
      code: "INTERNAL_ERROR",
      statusCode,
      stack: error.stack,
      userResponse: {
        message: statusCode >= 500 ? "Internal server error" : error.message,
        code: "INTERNAL_ERROR",
      },
    };
  }

  // Unknown error type
  const message = typeof error === "string" ? error : "Unknown error";
  return {
    name: "UnknownError",
    message,
    code: "INTERNAL_ERROR",
    statusCode: 500,
    userResponse: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  };
}

function getStatusFromORPCCode(code: string): number {
  const codeMap: Record<string, number> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    RATE_LIMITED: 429,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  };
  return codeMap[code] || 500;
}

// =============================================================================
// Unified Error Handler
// =============================================================================

/**
 * Process any error: log it, capture to monitoring, return formatted response.
 *
 * This is the SINGLE source of truth for error handling across the entire API.
 * Used by both oRPC onError interceptor and Fastify error handler.
 */
export function handleError(
  error: unknown,
  context: ErrorContext = {}
): { statusCode: number; response: ErrorResponse } {
  const normalized = normalizeError(error);
  const severity: ErrorSeverity = normalized.statusCode >= 500 ? "error" : "warning";

  // Build the full log context
  const logContext = {
    timestamp: new Date().toISOString(),
    severity,
    error: {
      name: normalized.name,
      message: normalized.message,
      code: normalized.code,
      statusCode: normalized.statusCode,
      stack: process.env.NODE_ENV !== "production" ? normalized.stack : undefined,
      debug: normalized.debug,
    },
    context: {
      source: context.source,
      userId: context.userId,
      tenantId: context.tenantId,
      method: context.method,
      url: context.url,
      ip: context.ip,
      userAgent: context.userAgent,
      ...context.extra,
    },
  };

  // =========================================================================
  // 1. Log via OTEL Logger (handles console + PostHog export)
  // =========================================================================
  const logger = getAppLogger();
  const logDetails = {
    traceId: context.analyticsContext?.traceId,
    posthogDistinctId: context.analyticsContext?.distinctId || context.userId || "anonymous",
    posthogSessionId: context.analyticsContext?.sessionId,
    userId: context.userId,
    tenantId: context.tenantId,
    httpMethod: context.method,
    httpUrl: context.url,
    httpStatusCode: normalized.statusCode,
    errorType: normalized.name,
    errorMessage: normalized.message,
    errorStack: process.env.NODE_ENV !== "production" ? normalized.stack : undefined,
    errorCode: normalized.code,
    source: context.source,
    ip: context.ip,
    userAgent: context.userAgent,
    ...normalized.debug,
    ...context.extra,
  };

  if (severity === "error") {
    logger.error(`[${normalized.code}] ${normalized.message}`, logDetails);
  } else {
    logger.warn(`[${normalized.code}] ${normalized.message}`, logDetails);
  }

  // =========================================================================
  // 2. Also capture to PostHog as event (for backward compatibility)
  // =========================================================================
  const distinctId = context.analyticsContext?.distinctId || context.userId || "anonymous";
  trackServerEvent("$exception", distinctId, {
    $exception_type: normalized.name,
    $exception_message: normalized.message,
    $exception_stack_trace: normalized.stack,
    severity,
    error_code: normalized.code,
    status_code: normalized.statusCode,
    source: context.source,
    method: context.method,
    url: context.url,
    ip: context.ip,
    user_agent: context.userAgent,
    tenant_id: context.tenantId,
    user_id: context.userId,
  });

  // =========================================================================
  // 3. Capture to Sentry (uncomment when needed)
  // =========================================================================
  // import * as Sentry from "@sentry/node";
  // Sentry.withScope((scope) => {
  //   scope.setLevel(severity === "fatal" ? "fatal" : severity === "error" ? "error" : "warning");
  //   scope.setUser({ id: context.userId });
  //   scope.setTag("source", context.source);
  //   scope.setTag("tenant_id", context.tenantId);
  //   scope.setContext("request", { method: context.method, url: context.url, ip: context.ip });
  //   Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
  // });

  // =========================================================================
  // 4. Record to OpenTelemetry (uncomment when needed)
  // =========================================================================
  // import { trace, SpanStatusCode } from "@opentelemetry/api";
  // const span = trace.getActiveSpan();
  // if (span) {
  //   span.recordException(error instanceof Error ? error : new Error(String(error)));
  //   span.setStatus({ code: SpanStatusCode.ERROR, message: normalized.message });
  //   span.setAttributes({
  //     "error.type": normalized.name,
  //     "error.code": normalized.code,
  //     "user.id": context.userId,
  //     "tenant.id": context.tenantId,
  //   });
  // }

  // =========================================================================
  // 5. Return formatted response for client
  // =========================================================================
  return {
    statusCode: normalized.statusCode,
    response: normalized.userResponse,
  };
}

// =============================================================================
// Helper: Create error context from Fastify request
// =============================================================================

export function createContextFromRequest(
  request: {
    method: string;
    url: string;
    ip: string;
    headers: Record<string, string | string[] | undefined>;
    analyticsContext?: ServerAnalyticsContext;
  },
  user?: { id: string; activeTenantId?: string | null }
): ErrorContext {
  return {
    source: request.url,
    userId: user?.id,
    tenantId: user?.activeTenantId ?? undefined,
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers["user-agent"] as string | undefined,
    analyticsContext: request.analyticsContext,
  };
}

// =============================================================================
// Helper: Throw oRPC error (for use in actions)
// =============================================================================

/**
 * Throw an oRPC error. Use this in action files.
 *
 * @example
 * throwError("NOT_FOUND", "User not found");
 * throwError("VALIDATION_ERROR", "Invalid email", { fields: { email: "Invalid format" } });
 */
export function throwError(code: string, message: string, data?: Record<string, unknown>): never {
  throw new ORPCError(code, { message, data });
}
