import fastifySwagger from "@fastify/swagger";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export default fastifyPlugin(
    async (fastify: FastifyInstance) => {
        await fastify.register(fastifySwagger, {
            openapi: {
                info: {
                    title: "Glue Demo API",
                    description:
                        "The Glue Demo API allows customers to programmatically retrieve and manage data related to their performance management processes.",
                    version: "0.1.0",
                    contact: {
                        name: "Glue Demo",
                        url: "https://www.glue-demo.com/contact",
                        email: "info@glue-demo.com",
                    },
                },
                servers: [
                    {
                        url: "https://api.talent.glue-demo.com/",
                    },
                ],
                externalDocs: {
                    url: "https://support.glue-demo.com/article/183-api-reference",
                    description: "Glue Demo API Reference",
                },
                components: {
                    securitySchemes: {},
                },
            },
            transform: jsonSchemaTransform,
        });
    },
    { dependencies: ["config"] }
);
