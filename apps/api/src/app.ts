import fastifyAuth from "@fastify/auth";
import fastifyHelmet from "@fastify/helmet";
import type { FastifyReply, FastifyRequest } from "fastify";
import Fastify, { type FastifyError } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import plugins from "./plugins";
import attachRoutes from "./routes";
import { globalErrorHandler } from "./utils/error-handling";
import { getLoggerConfig } from "./utils/logging-handling";

export const build = async (options = {}) => {
  const fastify = Fastify({
    logger: getLoggerConfig(),
    pluginTimeout: 10000,
    ...options,
  });

  // Add schema validator and serializer
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  /**
   * Does not provide an authentication strategy, but it provides a very fast utility to handle authentication
   *
   * @see https://github.com/fastify/fastify-auth
   */
  await fastify.register(fastifyAuth);

  /**
   * This plugin adds some security headers to the response
   *
   * @see https://github.com/fastify/fastify-helmet
   */
  await fastify.register(fastifyHelmet, {
    global: true,
  });

  // Easier to navigate plugins instead of having them all in one file
  await fastify.register(plugins);

  // This sets an error handler for the whole application so any errors will be logged and handled
  fastify.setErrorHandler(
    async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      // Any HTTP error will be filtered we want to ensure we are consistent with the status code
      const { statusCode, response } = globalErrorHandler(fastify, error, request);

      // Now lets forward the error to the client
      reply.status(statusCode).send({ ...response });
    }
  );

  // Handle closing of Fastify instance
  fastify.addHook("onClose", (_instance, done) => {
    fastify.log.info("Closing Fastify instance");
    done();
  });

  // attach routes
  fastify.after(() => {
    attachRoutes(fastify);
  });
  return fastify;
};
