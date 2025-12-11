import type { AuthConfig } from "auth";
import type { Session, User } from "better-auth/types";
import type { db } from "database";
import { type FastifyReply } from "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    startTime?: [number, number];
    span?: Span;
    session?: Session;
    user?: User;
  }

  export interface FastifyInstance {
    verify(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    auth: AuthConfig;
    db: typeof db;
    config: {
      ENVIRONMENT_STAGE: string;
      GIT_BRANCH: string;
      GIT_HASH: string;
      NODE_ENV: string;
      PORT: number;
      HOST: string;
      AWS_REGION: string;
      DATABASE_URL: string;
      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;
    };
  }
}
