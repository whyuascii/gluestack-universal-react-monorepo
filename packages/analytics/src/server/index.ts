/**
 * Server-side Analytics Exports
 *
 * Usage:
 *   import { initServerAnalytics, trackServerEvent } from "@app/analytics/server";
 *   import { createLogger, initOtelLogging } from "@app/analytics/server";
 */

// Core functions
export {
  initServerAnalytics,
  trackServerEvent,
  trackServerEventWithContext,
  identifyServerUser,
  captureServerError,
  shutdownAnalytics,
  flushServerEvents,
  // Feature flags
  isFeatureFlagEnabled,
  getFeatureFlag,
  getFeatureFlagPayload,
  getAllFeatureFlags,
  reloadFeatureFlags,
} from "./posthog";

// OTEL Logging
export {
  initOtelLogging,
  getLoggerProvider,
  shutdownOtelLogging,
  flushOtelLogs,
  shouldLogSeverity,
} from "./otel-config";

export type { OtelConfig } from "./otel-config";

// Logger
export { createLogger, createRequestLogger } from "./logger";

export type { AppLogger, LogContext, LoggerOptions } from "./logger";

// Middleware
export {
  analyticsMiddleware,
  extractAnalyticsContext,
  getRequestContext,
  TRACE_ID_HEADER,
  DISTINCT_ID_HEADER,
  SESSION_ID_HEADER,
} from "./middleware";

// Types
export type {
  ServerAnalyticsConfig,
  ServerAnalyticsContext,
  ServerEventProperties,
  ServerUserProperties,
} from "./types";

// Events (allowlist & scrubbing)
export {
  ALLOWED_EVENTS,
  isAllowedEvent,
  getEventSchema,
  scrubEvent,
  eventRequiresAuth,
  type AllowedEventName,
  type EventSchema,
  type ScrubResult,
  type ScrubError,
} from "../events";
