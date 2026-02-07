/**
 * Response Compression Plugin
 *
 * Enables gzip/brotli compression for API responses.
 * Reduces payload sizes by 60-80%, especially beneficial for mobile.
 *
 * @see https://github.com/fastify/fastify-compress
 */

import compress from "@fastify/compress";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import zlib from "zlib";

export default fastifyPlugin(async (fastify: FastifyInstance) => {
  await fastify.register(compress, {
    // Enable gzip and brotli (brotli has better compression)
    encodings: ["br", "gzip", "deflate"],

    // Only compress responses larger than 1KB
    threshold: 1024,

    // Compression level (1-11 for brotli, 1-9 for gzip)
    // Using moderate levels for balance of speed vs compression
    brotliOptions: {
      params: {
        // Level 4 is a good balance for dynamic content
        [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
      },
    },
    zlibOptions: {
      level: 6, // gzip level 6 is default, good balance
    },

    // Don't compress if client doesn't support it
    onUnsupportedEncoding: (_encoding, _request, reply) => {
      reply.code(406);
      return "Unsupported encoding";
    },
  });

  fastify.log.info("[Compression] Response compression enabled (br, gzip, deflate)");
});
