import { type FastifyReply } from "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    startTime?: [number, number];
    span?: Span;
  }

  export interface FastifyInstance {
    verify(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    config: {
      ENVIRONMENT_STAGE: string;
      GIT_BRANCH: string;
      GIT_HASH: string;
      NODE_ENV: string;
      PORT: number;
      HOST: string;
      AWS_REGION: string;
    };
  }
}
