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
      required: ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL"],
      properties: {
        // Core
        PORT: { type: "number", default: 3030 },
        HOST: { type: "string", default: "0.0.0.0" },
        NODE_ENV: { type: "string", default: "production" },
        ENVIRONMENT_STAGE: { type: "string", default: "production" },

        // Database
        DATABASE_URL: {
          type: "string",
          default: "postgresql://postgres:postgres@localhost:5432/repo_development",
        },

        // Auth
        BETTER_AUTH_SECRET: { type: "string" },
        BETTER_AUTH_URL: { type: "string", default: "http://localhost:3030" },

        // App URLs
        NEXT_PUBLIC_APP_URL: { type: "string", default: "http://localhost:3000" },

        // CORS
        ALLOWED_ORIGINS: { type: "string", default: "" },

        // Branding (optional)
        APP_NAME: { type: "string", default: "My App" },
        EMAIL_FROM_ADDRESS: { type: "string", default: "noreply@example.com" },

        // Analytics (optional) - prefer POSTHOG_* vars, fallback to NEXT_PUBLIC_* for compatibility
        POSTHOG_KEY: { type: "string", default: "" },
        POSTHOG_HOST: { type: "string", default: "https://us.i.posthog.com" },
        NEXT_PUBLIC_POSTHOG_KEY: { type: "string", default: "" },
        NEXT_PUBLIC_POSTHOG_HOST: { type: "string", default: "https://us.i.posthog.com" },

        // Build info
        GIT_BRANCH: { type: "string", default: "N/A" },
        GIT_HASH: { type: "string", default: "N/A" },

        // Legacy/Infrastructure
        AWS_REGION: { type: "string", default: "us-east-1" },
      },
    };

    const configOptions = {
      // decorate the Fastify server instance with `config` key
      // such as `fastify.config('PORT')
      confKey: "config",
      schema: envSchema,
      data: process.env,
      // Dotenv is already loaded in index.ts - don't load it again
      dotenv: false,
      // will remove the additional properties
      // from the data object which creates an
      // explicit schema
      removeAdditional: true,
    };

    fastifyEnv(fastify, configOptions, done);
  },
  { name: "config" }
);
