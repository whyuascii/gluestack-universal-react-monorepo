import type { FastifyRequest } from "fastify";
import pino from "pino";

/**
 *
 * Fastify Logger Configuration
 *
 * @see https://github.com/pinojs/pino-pretty
 * @see https://fastify.dev/docs/latest/Reference/Logging/#log-redaction
 */
export const getLoggerConfig = () => {
  const baseConfig = {
    level: "debug",
    serializers: {
      req: (req: FastifyRequest) => {
        return {
          method: req.method,
          url: req.url,
          headers: req.headers,
          hostname: req.hostname,
          remoteAddress: req.ip,
          remotePort: req.socket.remotePort,
        };
      },
      reply: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
  };

  const prodConfig = { ...baseConfig };
  prodConfig.level = "info";

  switch (process.env.NODE_ENV) {
    case "local":
      return {
        ...baseConfig,
        transport: {
          target: "pino-pretty",
          options: {
            translateTime: "HH:MM:ss Z", // example: 14:22:33 +0000
            ignore: "pid,hostname", // ignore pid and hostname
            colorize: true,
          },
        },
      };
    case "production":
      return {
        ...prodConfig,
      };
    case "test":
      return {
        ...baseConfig,
        level: "silent",
      };
    default:
      return {
        ...baseConfig,
      };
  }
};
