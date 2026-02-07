import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import analytics from "./analytics";
import auth from "./auth";
import compression from "./compression";
import config from "./config";
import cors from "./cors";
import events from "./events";
import mailer from "./mailer";
import novuBridge from "./novu-bridge";
import rateLimit from "./rate-limit";

/**
 * Fastify Plugins
 *
 * Plugins provide core infrastructure:
 * - config: Environment variable validation
 * - compression: Response compression (gzip/brotli)
 * - analytics: Server-side PostHog analytics with request tracing
 * - mailer: Email sending service (Resend + React Email templates)
 * - events: Event emitter with notification handlers
 * - novuBridge: Novu Framework bridge for workflow sync (/api/novu/*)
 * - auth: Better Auth integration (/api/auth/*)
 * - cors: Cross-origin resource sharing
 * - rateLimit: Request rate limiting
 *
 * Note: OpenAPI/Swagger is handled by oRPC's OpenAPIHandler
 */
export default fastifyPlugin(async (fastify: FastifyInstance) => {
  // Config must be registered first (other plugins depend on it)
  await fastify.register(config);

  // Compression should be early in the chain
  await fastify.register(compression);

  // Analytics depends on config
  await fastify.register(analytics);

  // Mailer depends on config
  await fastify.register(mailer);

  // Events system (notification handlers)
  await fastify.register(events);

  // Novu Framework bridge (workflow sync)
  await fastify.register(novuBridge);

  // Auth depends on config
  await fastify.register(auth);

  // CORS and rate limiting can be registered in parallel
  await Promise.all([fastify.register(cors), fastify.register(rateLimit)]);
});
