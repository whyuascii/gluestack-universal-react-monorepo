import fastifyEnv from "@fastify/env";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(
    (
        fastify: FastifyInstance,
        _options: FastifyPluginOptions,
        done: (err?: Error | undefined) => void
    ) => {
        const envSchema = {
            type: "object",
            required: [],
            properties: {
                AWS_REGION: { type: "string", default: "us-east-1" },
                PORT: { type: "number", default: 3030 },
                GIT_BRANCH: { type: "string", default: "N/A" },
                GIT_HASH: { type: "string", default: "N/A" },
                HOST: { type: "string", default: "0.0.0.0" },
                ENVIRONMENT_STAGE: { type: "string", default: "production" },
                NODE_ENV: { type: "string", default: "production" },
            },
        };

        const configOptions = {
            // decorate the Fastify server instance with `config` key
            // such as `fastify.config('PORT')
            confKey: "config",
            schema: envSchema,
            data: process.env,
            dotenv: !!(
                process.env.NODE_ENV !== "production" &&
                process.env.NODE_ENV !== "test"
            ),
            // will remove the additional properties
            // from the data object which creates an
            // explicit schema
            removeAdditional: true,
        };

        fastifyEnv(fastify, configOptions, done);
    },
    { name: "config" }
);
