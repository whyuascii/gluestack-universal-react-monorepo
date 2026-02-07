/**
 * OTEL Logger Wrapper
 *
 * Provides a Pino-compatible interface for logging.
 * - Development: Pretty console output
 * - Production: OTEL export to PostHog + console output
 *
 * Usage:
 *   import { createLogger } from "@app/analytics/server";
 *   const logger = createLogger({ serviceName: "api" });
 *   logger.error("Something failed", { error, userId, traceId });
 */

import { logs, SeverityNumber, Logger as OtelLogger } from "@opentelemetry/api-logs";
import type { ServerAnalyticsContext } from "./types";
import { shouldLogSeverity } from "./otel-config";

export interface LogContext extends Record<string, unknown> {
  // Request/user context
  traceId?: string;
  userId?: string;
  tenantId?: string;
  posthogDistinctId?: string;
  posthogSessionId?: string;

  // Error details
  error?: Error;
  errorType?: string;
  errorMessage?: string;
  errorStack?: string;

  // HTTP context
  httpMethod?: string;
  httpUrl?: string;
  httpStatusCode?: number;
}

export interface LoggerOptions {
  serviceName: string;
  serviceVersion?: string;
  defaultContext?: Partial<LogContext>;
}

export interface AppLogger {
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
  child: (bindings: Partial<LogContext>) => AppLogger;
  withContext: (ctx: ServerAnalyticsContext) => AppLogger;
}

const isDev = process.env.NODE_ENV === "development";

/**
 * Format log message for console output
 */
function formatConsoleMessage(
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  // Exclude the error object from JSON.stringify to avoid circular references
  const { error, ...restContext } = context || {};
  const contextStr = Object.keys(restContext).length > 0 ? ` ${JSON.stringify(restContext)}` : "";

  if (isDev) {
    const colors = {
      INFO: "\x1b[36m", // cyan
      WARN: "\x1b[33m", // yellow
      ERROR: "\x1b[31m", // red
    };
    const reset = "\x1b[0m";
    return `${colors[level]}[${timestamp}] ${level}${reset}: ${message}${contextStr}`;
  }

  return `[${timestamp}] ${level}: ${message}${contextStr}`;
}

/**
 * Convert Error to log attributes
 */
function errorToAttributes(error: Error): Record<string, string> {
  return {
    "error.type": error.name || "Error",
    "error.message": error.message,
    "error.stack": error.stack || "",
  };
}

/**
 * Create OTEL log attributes from context
 * Only includes primitive values that OTEL can handle
 */
function contextToAttributes(context?: LogContext): Record<string, string | number | boolean> {
  if (!context) return {};

  const attrs: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(context)) {
    if (key === "error" && value instanceof Error) {
      Object.assign(attrs, errorToAttributes(value));
    } else if (value !== undefined && value !== null) {
      // Only include primitive values
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        attrs[key] = value;
      } else if (typeof value === "object") {
        // Stringify objects
        try {
          attrs[key] = JSON.stringify(value);
        } catch {
          attrs[key] = String(value);
        }
      }
    }
  }

  return attrs;
}

/**
 * Create a logger instance
 */
export function createLogger(options: LoggerOptions): AppLogger {
  const { serviceName, defaultContext = {} } = options;

  let otelLogger: OtelLogger | null = null;

  // Get OTEL logger (may be null if not initialized)
  try {
    otelLogger = logs.getLogger(serviceName);
  } catch {
    // OTEL not initialized, will use console only
  }

  function log(
    level: "INFO" | "WARN" | "ERROR",
    severityNumber: SeverityNumber,
    message: string,
    context?: LogContext
  ): void {
    const mergedContext = { ...defaultContext, ...context };

    // Always output to console in development, or for errors
    if (isDev || level === "ERROR") {
      const consoleMethod =
        level === "ERROR" ? console.error : level === "WARN" ? console.warn : console.log;
      consoleMethod(formatConsoleMessage(level, message, mergedContext));
    }

    // Only emit to OTEL for WARN and ERROR (filter at source)
    if (otelLogger && shouldLogSeverity(severityNumber)) {
      otelLogger.emit({
        severityNumber,
        severityText: level,
        body: message,
        attributes: contextToAttributes(mergedContext),
      });
    }
  }

  const logger: AppLogger = {
    info: (message: string, context?: LogContext) => {
      log("INFO", SeverityNumber.INFO, message, context);
    },

    warn: (message: string, context?: LogContext) => {
      log("WARN", SeverityNumber.WARN, message, context);
    },

    error: (message: string, context?: LogContext) => {
      log("ERROR", SeverityNumber.ERROR, message, context);
    },

    child: (bindings: Partial<LogContext>) => {
      return createLogger({
        ...options,
        defaultContext: { ...defaultContext, ...bindings },
      });
    },

    withContext: (ctx: ServerAnalyticsContext) => {
      return logger.child({
        traceId: ctx.traceId,
        posthogDistinctId: ctx.distinctId,
        posthogSessionId: ctx.sessionId,
      });
    },
  };

  return logger;
}

/**
 * Create a request-scoped logger with analytics context
 */
export function createRequestLogger(
  baseLogger: AppLogger,
  context: ServerAnalyticsContext,
  httpContext?: {
    method?: string;
    url?: string;
  }
): AppLogger {
  return baseLogger.child({
    traceId: context.traceId,
    posthogDistinctId: context.distinctId,
    posthogSessionId: context.sessionId,
    httpMethod: httpContext?.method,
    httpUrl: httpContext?.url,
  });
}
