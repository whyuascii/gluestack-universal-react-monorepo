/**
 * Next.js Instrumentation
 *
 * Initializes OpenTelemetry logging for server-side code.
 * Sends WARN and ERROR level logs to PostHog's OTLP endpoint.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamically import OTEL modules to avoid bundling issues
    const apiLogs = await import("@opentelemetry/api-logs");
    const sdkLogs = await import("@opentelemetry/sdk-logs");
    const exporter = await import("@opentelemetry/exporter-logs-otlp-http");
    const resources = await import("@opentelemetry/resources");
    const conventions = await import("@opentelemetry/semantic-conventions");

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    const enabled =
      process.env.NODE_ENV === "production" || process.env.POSTHOG_LOGS_ENABLED === "true";

    // Skip if no API key or disabled
    if (!apiKey || !enabled) {
      console.log("[OTEL] Logging disabled (no API key or POSTHOG_LOGS_ENABLED !== 'true')");
      return;
    }

    const otlpExporter = new exporter.OTLPLogExporter({
      url: `${host}/i/v1/logs`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Use BatchLogRecordProcessor for efficiency
    const processor = new sdkLogs.BatchLogRecordProcessor(otlpExporter, {
      maxExportBatchSize: 512,
      scheduledDelayMillis: 5000,
      exportTimeoutMillis: 30000,
      maxQueueSize: 2048,
    });

    const serviceName = process.env.APP_NAME ? `${process.env.APP_NAME}-web` : "app-web";
    const resource = new resources.Resource({
      [conventions.ATTR_SERVICE_NAME]: serviceName,
      [conventions.ATTR_SERVICE_VERSION]: process.env.npm_package_version || "1.0.0",
    });

    const loggerProvider = new sdkLogs.LoggerProvider({
      resource,
    });

    loggerProvider.addLogRecordProcessor(processor);
    apiLogs.logs.setGlobalLoggerProvider(loggerProvider);

    console.log("[OTEL] Web logging initialized - sending logs to PostHog");
  }
}
