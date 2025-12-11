import { createAuthConfig } from "auth";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";

/**
 * Auth plugin that:
 * 1. Initializes Better Auth with database connection
 * 2. Decorates Fastify instance with betterAuth instance
 * 3. Provides authentication verification preHandler (verifyAuth)
 */
export default fastifyPlugin(
  async (fastify: FastifyInstance) => {
    try {
      // Create Better Auth instance
      const betterAuth = createAuthConfig();

      // Decorate fastify instance with betterAuth
      fastify.decorate("betterAuth", betterAuth);

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

      fastify.log.info("Better Auth initialized");
    } catch (err) {
      fastify.log.error({ message: "Failed to initialize Better Auth", error: err });
      throw err;
    }
  },
  { name: "betterAuth", dependencies: ["config", "database"] }
);
