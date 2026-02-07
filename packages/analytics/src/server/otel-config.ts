/**
 * OpenTelemetry Configuration for PostHog Logs
 *
 * Initializes OTEL LoggerProvider with PostHog OTLP exporter.
 * Filters to WARN and ERROR level logs only.
 */

import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import {
  LoggerProvider,
  BatchLogRecordProcessor,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

export interface OtelConfig {
  serviceName: string;
  serviceVersion?: string;
  apiKey: string;
  host?: string;
  enabled?: boolean;
}

let loggerProvider: LoggerProvider | null = null;

/**
 * Initialize OTEL LoggerProvider with PostHog OTLP exporter
 */
export function initOtelLogging(config: OtelConfig): LoggerProvider {
  // Don't reinitialize if already set up
  if (loggerProvider) {
    return loggerProvider;
  }

  // Skip initialization if disabled or no API key
  if (config.enabled === false || !config.apiKey) {
    // Return a no-op provider
    loggerProvider = new LoggerProvider();
    logs.setGlobalLoggerProvider(loggerProvider);
    return loggerProvider;
  }

  const host = config.host || "https://us.i.posthog.com";
  const otlpEndpoint = `${host}/i/v1/logs`;

  const exporter = new OTLPLogExporter({
    url: otlpEndpoint,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
  });

  // Use BatchLogRecordProcessor for production efficiency
  const processor =
    process.env.NODE_ENV === "production"
      ? new BatchLogRecordProcessor(exporter, {
          maxExportBatchSize: 512,
          scheduledDelayMillis: 5000,
          exportTimeoutMillis: 30000,
          maxQueueSize: 2048,
        })
      : new SimpleLogRecordProcessor(exporter);

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: config.serviceName,
    [ATTR_SERVICE_VERSION]: config.serviceVersion || "1.0.0",
  });

  loggerProvider = new LoggerProvider({
    resource,
  });

  loggerProvider.addLogRecordProcessor(processor);
  logs.setGlobalLoggerProvider(loggerProvider);

  return loggerProvider;
}

/**
 * Get the global LoggerProvider
 */
export function getLoggerProvider(): LoggerProvider | null {
  return loggerProvider;
}

/**
 * Shutdown OTEL logging and flush remaining logs
 */
export async function shutdownOtelLogging(): Promise<void> {
  if (loggerProvider) {
    await loggerProvider.forceFlush();
    await loggerProvider.shutdown();
    loggerProvider = null;
  }
}

/**
 * Force flush any pending logs
 */
export async function flushOtelLogs(): Promise<void> {
  if (loggerProvider) {
    await loggerProvider.forceFlush();
  }
}

/**
 * Check if severity level should be logged (WARN and ERROR only)
 */
export function shouldLogSeverity(severityNumber: SeverityNumber): boolean {
  return severityNumber >= SeverityNumber.WARN;
}
