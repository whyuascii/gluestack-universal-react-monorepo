/**
 * Mobile Logger (React Native)
 *
 * Fallback logger for React Native since OTEL doesn't work well in RN.
 * Uses PostHog SDK to send errors and warnings as events.
 *
 * Usage:
 *   import { logger } from "@app/analytics/mobile/logger";
 *   logger.error("Something failed", { userId: "123" });
 */

import { trackError as posthogTrackError, trackEvent } from "../helpers/analytics.mobile";

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

// Simple event properties type for PostHog
type EventProperties = Record<string, string | number | boolean | null>;

export interface MobileLogger {
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
  child: (bindings: Partial<LogContext>) => MobileLogger;
}

// Check if we're in development mode
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV === "development";

/**
 * Format context for console output
 */
function formatContext(context?: LogContext): string {
  if (!context) return "";
  const { error, ...rest } = context;
  const errorInfo = error ? { errorMessage: error.message, errorStack: error.stack } : {};
  return JSON.stringify({ ...rest, ...errorInfo });
}

/**
 * Convert Error to properties for PostHog
 */
function errorToProperties(error: Error): EventProperties {
  return {
    error_type: error.name || "Error",
    error_message: error.message,
    error_stack: error.stack || null,
  };
}

/**
 * Convert LogContext to EventProperties (primitive values only)
 */
function contextToEventProperties(context?: LogContext): EventProperties {
  if (!context) return {};

  const props: EventProperties = {};

  for (const [key, value] of Object.entries(context)) {
    // Skip the error object - handled separately
    if (key === "error") continue;

    // Only include primitive values
    if (value === null) {
      props[key] = null;
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      props[key] = value;
    }
    // Skip objects, arrays, etc.
  }

  return props;
}

/**
 * Create a mobile logger instance
 */
export function createMobileLogger(defaultContext: Partial<LogContext> = {}): MobileLogger {
  const logger: MobileLogger = {
    info: (message: string, context?: LogContext) => {
      const mergedContext = { ...defaultContext, ...context };

      // Only log to console in development
      if (isDev) {
        console.log(`[INFO] ${message}`, formatContext(mergedContext));
      }

      // Don't send INFO to PostHog (per plan - only WARN and ERROR)
    },

    warn: (message: string, context?: LogContext) => {
      const mergedContext = { ...defaultContext, ...context };

      // Always log warnings to console
      console.warn(`[WARN] ${message}`, formatContext(mergedContext));

      // Send to PostHog as a warning event
      const eventProps: EventProperties = {
        message,
        severity: "warning",
        ...contextToEventProperties(mergedContext),
        ...(mergedContext.error ? errorToProperties(mergedContext.error) : {}),
      };
      trackEvent("$warning", eventProps);
    },

    error: (message: string, context?: LogContext) => {
      const mergedContext = { ...defaultContext, ...context };
      const error = mergedContext.error;

      // Always log errors to console
      console.error(`[ERROR] ${message}`, formatContext(mergedContext));

      // Send to PostHog via trackError
      const errorToTrack = error || new Error(message);
      const trackContext: EventProperties = {
        message,
        ...contextToEventProperties(mergedContext),
      };
      posthogTrackError("error", errorToTrack, trackContext);
    },

    child: (bindings: Partial<LogContext>) => {
      return createMobileLogger({ ...defaultContext, ...bindings });
    },
  };

  return logger;
}

/**
 * Default mobile logger instance
 */
export const logger = createMobileLogger();
