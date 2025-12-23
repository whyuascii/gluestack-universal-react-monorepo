import { createAuthConfig } from "@app/auth/server";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";

/**
 * Auth plugin that:
 * 1. Initializes Better Auth with database connection
 * 2. Mounts Better Auth handler at /api/auth/*
 * 3. Decorates Fastify instance with betterAuth instance
 * 4. Provides authentication verification preHandler (verifyAuth)
 */
export default fastifyPlugin(
  async (fastify: FastifyInstance) => {
    try {
      // Create Better Auth instance
      const betterAuth = createAuthConfig();

      // Decorate fastify instance with betterAuth
      fastify.decorate("betterAuth", betterAuth);

      // Mount Better Auth handler at /api/auth/*
      fastify.all("/api/auth/*", async (request, reply) => {
        // Convert Fastify request to Web Request
        const url = new URL(request.url, `${request.protocol}://${request.hostname}`);

        const webRequest = new Request(url, {
          method: request.method,
          headers: request.headers as Record<string, string>,
          body:
            request.method !== "GET" && request.method !== "HEAD"
              ? JSON.stringify(request.body)
              : undefined,
        });

        // Call Better Auth handler
        const response = await betterAuth.handler(webRequest);

        // Convert Web Response to Fastify reply
        reply.status(response.status);

        // Set headers
        response.headers.forEach((value: string, key: string) => {
          reply.header(key, value);
        });

        // Send body
        const body = await response.text();
        return reply.send(body);
      });

      // Decorate with verifyAuth method for protecting routes
      fastify.decorate("verifyAuth", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          // Get session from Better Auth
          const session = await betterAuth.api.getSession({
            headers: request.headers,
          });

          if (!session) {
            return reply.status(401).send({
              message: "Unauthorized - No valid session",
              code: "UNAUTHORIZED",
            });
          }

          // Attach session to request for use in handlers
          request.session = session.session;
          request.user = session.user;
        } catch (error) {
          fastify.log.error({ message: "Authentication error", error });
          return reply.status(401).send({
            message: "Unauthorized - Invalid session",
            code: "UNAUTHORIZED",
          });
        }
      });

      fastify.log.info("Better Auth initialized and mounted at /api/auth/*");
    } catch (err) {
      fastify.log.error({ message: "Failed to initialize Better Auth", error: err });
      throw err;
    }
  },
  { name: "betterAuth", dependencies: ["config", "database"] }
);
