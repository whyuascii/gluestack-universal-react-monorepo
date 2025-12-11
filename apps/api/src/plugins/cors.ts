import fastifyCors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(
  async (fastify: FastifyInstance) => {
    await fastify.register(fastifyCors, {
      // Decided to allow all origins since this is a public API that any company can use
      origin: "*",
      credentials: true,
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    });
  },
  { name: "cors", dependencies: ["config"] }
);
