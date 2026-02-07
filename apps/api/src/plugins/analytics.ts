import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { initServerAnalytics, analyticsMiddleware, shutdownAnalytics } from "@app/analytics/server";

/**
 * Analytics Plugin
 *
 * Initializes server-side PostHog analytics and adds request tracing middleware.
 *
 * Features:
 * - Server-side event tracking
 * - Request correlation via x-trace-id header
 * - User linking via x-posthog-distinct-id header
 * - Graceful shutdown handling
 */
export default fastifyPlugin(
  async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
    // Initialize PostHog with API key from config
    const apiKey = fastify.config.POSTHOG_KEY || fastify.config.NEXT_PUBLIC_POSTHOG_KEY;
    const host = fastify.config.POSTHOG_HOST || fastify.config.NEXT_PUBLIC_POSTHOG_HOST;

    if (apiKey) {
      initServerAnalytics({
        apiKey,
        host,
        flushAt: 20,
        flushInterval: 10000,
      });

      fastify.log.info("Server analytics initialized");

      // Register the analytics middleware for request tracing
      await fastify.register(analyticsMiddleware);

      // Shutdown analytics on server close
      fastify.addHook("onClose", async () => {
        await shutdownAnalytics();
      });
    } else {
      fastify.log.warn("POSTHOG_KEY not set - server analytics disabled");
    }
  },
  { name: "analytics", dependencies: ["config"] }
);
