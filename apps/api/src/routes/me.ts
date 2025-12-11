import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { MeResponse, AuthErrorResponse } from "service-contracts";

const attachHandlers = (fastify: FastifyInstance) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/me",
    preHandler: [fastify.verifyAuth],
    schema: {
      description: "Get current user session information",
      tags: ["Auth"],
      response: {
        200: MeResponse,
        401: AuthErrorResponse,
      },
    },
    handler: async (request, reply) => {
      // Session and user are attached by the verifyAuth preHandler
      const { session, user } = request;

      if (!session || !user) {
        return reply.status(401).send({
          message: "Unauthorized - No valid session",
          code: "UNAUTHORIZED",
        });
      }

      reply.send({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
        },
        session: {
          id: session.id,
          expiresAt: session.expiresAt,
        },
      });
    },
  });
};

export default attachHandlers;
