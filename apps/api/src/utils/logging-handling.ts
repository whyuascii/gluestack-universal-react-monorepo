import type { FastifyRequest } from "fastify";
import pino from "pino";
import {
  initOtelLogging,
  createLogger,
  shutdownOtelLogging,
  flushOtelLogs,
  type AppLogger,
} from "@app/analytics/server";

// =============================================================================
// OTEL Logger Initialization
// =============================================================================

let appLogger: AppLogger | null = null;

/**
 * Initialize OTEL logging for PostHog
 *
 * Call this at application startup before processing requests.
 */
export function initApiLogging(): AppLogger {
  // Initialize OTEL with PostHog endpoint
  initOtelLogging({
    serviceName: "app-api",
    serviceVersion: process.env.npm_package_version || "1.0.0",
    apiKey: process.env.POSTHOG_KEY || "",
    host: process.env.POSTHOG_HOST,
    enabled: process.env.NODE_ENV === "production" || process.env.POSTHOG_LOGS_ENABLED === "true",
  });

  // Create the application logger
  appLogger = createLogger({
    serviceName: "app-api",
    serviceVersion: process.env.npm_package_version || "1.0.0",
  });

  return appLogger;
}

/**
 * Get the application logger instance
 */
export function getAppLogger(): AppLogger {
  if (!appLogger) {
    // Auto-initialize if not already done
    return initApiLogging();
  }
  return appLogger;
}

/**
 * Shutdown OTEL logging gracefully
 */
export async function shutdownApiLogging(): Promise<void> {
  await flushOtelLogs();
  await shutdownOtelLogging();
}

// =============================================================================
// Fastify Logger Configuration (Pino)
// =============================================================================

/**
 * Fastify Logger Configuration
 *
 * Pino is still used for Fastify's built-in request/response logging.
 * Application-level logging (errors, warnings) goes through OTEL.
 *
 * @see https://github.com/pinojs/pino-pretty
 * @see https://fastify.dev/docs/latest/Reference/Logging/#log-redaction
 */
export const getLoggerConfig = (): pino.LoggerOptions => {
  const baseConfig = {
    level: "info",
    serializers: {
      req: (req: FastifyRequest) => {
        return {
          method: req.method,
          url: req.url,
          hostname: req.hostname,
          remoteAddress: req.ip,
        };
      },
      reply: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
  };

  switch (process.env.NODE_ENV) {
    case "local":
    case "development":
      return {
        ...baseConfig,
        level: "debug",
        transport: {
          target: "pino-pretty",
          options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
            colorize: true,
          },
        },
      };
    case "production":
      return {
        ...baseConfig,
        level: "info",
      };
    case "test":
      return {
        ...baseConfig,
        level: "silent",
      };
    default:
      return {
        ...baseConfig,
      };
  }
};
