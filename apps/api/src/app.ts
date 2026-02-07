import fastifyHelmet from "@fastify/helmet";
import type { FastifyReply, FastifyRequest } from "fastify";
import Fastify, { type FastifyError } from "fastify";
import { rpcHandler } from "./handler";
import { getCache, cacheKeys } from "./lib/cache";
import { createContextFromRequest, handleError } from "./lib/errors";
import { generateOpenAPISpec } from "./lib/openapi";
import plugins from "./plugins";
import attachRoutes from "./routes";
import { getLoggerConfig } from "./utils/logging-handling";

export const build = async (options = {}) => {
  const fastify = Fastify({
    logger: getLoggerConfig(),
    pluginTimeout: 10000,
    ...options,
  });

  /**
   * This plugin adds some security headers to the response
   *
   * @see https://github.com/fastify/fastify-helmet
   */
  await fastify.register(fastifyHelmet, {
    global: true,
  });

  // Easier to navigate plugins instead of having them all in one file
  await fastify.register(plugins);

  /**
   * OpenAPI Specification Endpoint
   *
   * Serves the generated OpenAPI 3.1 spec from oRPC contracts.
   * Cached for 5 minutes to avoid regenerating on every request.
   * Use this with Swagger UI, Redoc, or any OpenAPI-compatible tool.
   */
  fastify.get("/openapi.json", async (_request, reply) => {
    const cache = getCache();
    const cacheKey = cacheKeys.openapi();

    // Try cache first
    let spec = await cache.get<object>(cacheKey);

    if (!spec) {
      // Generate and cache for 5 minutes
      spec = await generateOpenAPISpec();
      await cache.set(cacheKey, spec, 300); // 5 minutes TTL
    }

    reply.header("Content-Type", "application/json");
    return spec;
  });

  /**
   * oRPC Content Type Parser
   *
   * Allow any content type and let oRPC parse the body manually.
   * This enables full oRPC features including file uploads and streaming.
   */
  fastify.addContentTypeParser("*", (_request, _payload, done) => {
    done(null, undefined);
  });

  /**
   * oRPC Handler - serves all RPC routes under /rpc/*
   *
   * Uses native Fastify integration for optimal performance.
   * Errors are captured via the onError interceptor in handler.ts
   */
  fastify.all("/rpc/*", async (req, reply) => {
    const { matched } = await rpcHandler.handle(req, reply, {
      prefix: "/rpc",
      context: {
        // Pass headers for auth middleware to access
        headers: req.headers,
        // Pass analytics context for error logging correlation
        analyticsContext: req.analyticsContext,
      },
    });

    if (!matched) {
      reply.status(404).send({ message: "RPC route not found" });
    }
  });

  /**
   * Global Fastify Error Handler
   *
   * Handles errors from non-oRPC routes (Better Auth, etc.).
   * Uses the same unified error handler as oRPC for consistent logging + monitoring.
   */
  fastify.setErrorHandler(
    async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      // Get user from request if authenticated
      const user = (
        request as FastifyRequest & { user?: { id: string; activeTenantId?: string | null } }
      ).user;

      // Use unified error handler for logging + monitoring + response formatting
      const { statusCode, response } = handleError(
        error,
        createContextFromRequest(
          {
            ...request,
            analyticsContext: request.analyticsContext,
          },
          user
        )
      );

      reply.status(statusCode).send(response);
    }
  );

  // Handle closing of Fastify instance
  fastify.addHook("onClose", (_instance, done) => {
    fastify.log.info("Closing Fastify instance");
    done();
  });

  // attach routes
  fastify.after(() => {
    attachRoutes(fastify);
  });
  return fastify;
};
