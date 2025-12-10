import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import config from "./config";
import cors from "./cors";
import sensible from "./sensible";
import swagger from "./swagger";

export default fastifyPlugin(async (fastify: FastifyInstance) => {
    // Config and Sensible plugins are registered together
    // to ensure it's available for other plugins
    await Promise.all([fastify.register(config), fastify.register(sensible)]);

    // All other plugins are registered in parallel

    await Promise.all([fastify.register(cors), fastify.register(swagger)]);
});
