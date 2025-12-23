import fastifyRateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

/**
 * This plugins adds support for rate limiting
 *
 * @see https://github.com/fastify/fastify-rate-limit
 */

export default fastifyPlugin(async (fastify: FastifyInstance) => {
  await fastify.register(fastifyRateLimit, {
    global: false,
    max: 100,
    timeWindow: 5000, // default 1000 * 60
    allowList: [], // default []
  });
});
