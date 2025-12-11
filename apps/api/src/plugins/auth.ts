import { createAuthConfig } from "auth";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";

/**
 * Auth plugin that:
 * 1. Initializes Better Auth with database connection
 * 2. Decorates Fastify instance with auth methods
 * 3. Provides authentication verification preHandler
 */
export default fastifyPlugin(
  async (fastify: FastifyInstance) => {
    try {
      // NOTE: Not sure if I need auth decorator. I think I just need verify
      // Decorate fastify instance with auth
      // fastify.decorate("auth", auth);

      // Decorate with verify method for protecting routes
      fastify.decorate("verify", async (request: FastifyRequest, reply: FastifyReply) => {
        // Create Better Auth instance
        const auth = createAuthConfig();
        try {
          // Get session from Better Auth
          const session = await auth.api.getSession({
            headers: request.headers as any,
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
  { name: "auth", dependencies: ["config", "database"] }
);
