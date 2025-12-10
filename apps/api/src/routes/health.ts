import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { GetHealthResponse } from "service-contracts";

const attachHandlers = (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/health",
        schema: {
            description: "Health Status",
            tags: ["Health"],
            response: {
                200: GetHealthResponse,
            },
        },
        handler: async (req, res) => {
            const environment = app.config.ENVIRONMENT_STAGE || "unknown";
            const gitBranch = app.config.GIT_BRANCH || "";
            const gitHash = app.config.GIT_HASH || "";
            const gitHashShort = gitHash.substring(0, 7) || "";

            const healthy = true;

            res.send({
                healthy,
                gitHash,
                gitHashShort,
                gitBranch,
                environment,
            });
        },
    });
};

export default attachHandlers;
