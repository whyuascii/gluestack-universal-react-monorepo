import { db } from "database";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(
  async (fastify: FastifyInstance) => {
    try {
      // Decorate fastify instance with database connection
      fastify.decorate("db", db);

      fastify.log.info("Database connection established");
    } catch (err) {
      fastify.log.error({ message: "Failed to connect to database", error: err });
    }
  },
  { name: "database", dependencies: ["config"] }
);
