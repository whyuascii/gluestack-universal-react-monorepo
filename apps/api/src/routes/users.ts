import { insertUserSchema, users, type InsertUser } from "database";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { GetUserResponse, UserErrorResponse } from "service-contracts";
import { RouteOptions } from "../models";

export default (app: FastifyInstance, routeOptions: RouteOptions) => {
  const { rootPath, versionPrefix } = routeOptions;
  const basePath = `/${versionPrefix}/${rootPath}`;

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: `${basePath}/users`,
    schema: {
      description: "Create a new user",
      tags: ["users"],
      body: insertUserSchema,
      response: {
        201: GetUserResponse,
        400: UserErrorResponse,
        500: UserErrorResponse,
      },
    },
    handler: async (request, reply) => {
      try {
        const userData = request.body as InsertUser;

        // Insert user into database
        const [newUser] = await app.db.insert(users).values(userData).returning();

        if (!newUser) {
          return reply.status(500).send({
            message: "Failed to create user",
          });
        }

        return reply.status(201).send(newUser);
      } catch (error) {
        app.log.error({ message: "Error creating user:", error: error });

        return reply.status(500).send({
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        });
      }
    },
  });
};
