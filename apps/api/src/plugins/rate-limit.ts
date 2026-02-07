import fastifyRateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

/**
 * Rate limit configuration
 *
 * Configure via environment variables:
 * - RATE_LIMIT_MAX: Maximum requests per window (default: 100)
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 60000 = 1 minute)
 */
const RATE_LIMIT_CONFIG = {
  max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
} as const;

/**
 * This plugins adds support for rate limiting
 *
 * @see https://github.com/fastify/fastify-rate-limit
 */
export default fastifyPlugin(async (fastify: FastifyInstance) => {
  await fastify.register(fastifyRateLimit, {
    global: false,
    max: RATE_LIMIT_CONFIG.max,
    timeWindow: RATE_LIMIT_CONFIG.windowMs,
    allowList: [],
  });
});
