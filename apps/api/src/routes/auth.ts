import type { FastifyInstance } from "fastify";
import { type ZodTypeProvider } from "fastify-type-provider-zod";
import {
  AuthenticationResponse,
  AuthErrorResponse,
  SignInRequest,
  SignUpRequest,
} from "service-contracts";
import { type RouteOptions } from "../models";

export default (app: FastifyInstance, routeOptions: RouteOptions) => {
  const { rootPath, versionPrefix } = routeOptions;
  const basePath = `/${versionPrefix}/${rootPath}`;

  // Sign Up (Register)
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: `${basePath}/signup`,
    schema: {
      description: "Register a new user account",
      tags: ["Auth"],
      body: SignUpRequest,
      response: {
        201: AuthenticationResponse,
        400: AuthErrorResponse,
        500: AuthErrorResponse,
      },
    },
    handler: async (request, reply) => {
      try {
        const { name, email, password } = request.body;

        // Use Better Auth to create account
        const result = await app.betterAuth.api.signUpEmail({
          body: {
            name,
            email,
            password,
          },
          headers: request.headers,
        });

        if (!result || !result.token) {
          return reply.status(400).send({
            message: "Failed to create account",
            code: "SIGNUP_FAILED",
          });
        }

        return reply.status(201).send({
          user: result.user,
          session: {
            token: result.token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        });
      } catch (error) {
        app.log.error({ message: "Error during signup", error });

        return reply.status(500).send({
          message: error instanceof Error ? error.message : "Internal server error",
          code: "SIGNUP_ERROR",
        });
      }
    },
  });

  // Sign In (Login)
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: `${basePath}/signin`,
    schema: {
      description: "Sign in with email and password",
      tags: ["Auth"],
      body: SignInRequest,
      response: {
        200: AuthenticationResponse,
        401: AuthErrorResponse,
        500: AuthErrorResponse,
      },
    },
    handler: async (request, reply) => {
      try {
        const { email, password } = request.body;

        // Use Better Auth to sign in
        const result = await app.betterAuth.api.signInEmail({
          body: {
            email,
            password,
          },
          headers: request.headers,
        });

        if (!result || !result.token) {
          return reply.status(401).send({
            message: "Invalid email or password",
            code: "INVALID_CREDENTIALS",
          });
        }

        return reply.status(200).send({
          user: result.user,
          session: {
            token: result.token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        });
      } catch (error) {
        app.log.error({ message: "Error during signin", error });

        return reply.status(500).send({
          message: error instanceof Error ? error.message : "Internal server error",
          code: "SIGNIN_ERROR",
        });
      }
    },
  });

  // Sign Out (Logout)
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: `${basePath}/signout`,
    preHandler: [app.verifyAuth],
    schema: {
      description: "Sign out and invalidate session",
      tags: ["Auth"],
      response: {
        200: AuthErrorResponse,
        401: AuthErrorResponse,
        500: AuthErrorResponse,
      },
    },
    handler: async (request, reply) => {
      try {
        // Use Better Auth to sign out
        await app.betterAuth.api.signOut({
          headers: request.headers,
        });

        return reply.status(200).send({
          message: "Successfully signed out",
        });
      } catch (error) {
        app.log.error({ message: "Error during signout", error });

        return reply.status(500).send({
          message: error instanceof Error ? error.message : "Internal server error",
          code: "SIGNOUT_ERROR",
        });
      }
    },
  });
};
