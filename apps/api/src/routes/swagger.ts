import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

const attachHandlers = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/swagger.json",
    schema: {
      description: "Swagger JSON",
      tags: ["Swagger"],
    },
    handler: async (req, res) => {
      res.send(app.swagger());
    },
  });
};

export default attachHandlers;
