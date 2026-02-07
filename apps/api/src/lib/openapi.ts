import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { contract } from "@app/core-contract";

/**
 * OpenAPI Spec Generator
 *
 * Generates OpenAPI 3.1 specification from oRPC contracts.
 * Uses Zod schemas to generate JSON Schema definitions.
 */
const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

/**
 * Generate OpenAPI specification from contracts
 */
/**
 * Generate OpenAPI specification from contracts
 *
 * CUSTOMIZATION: Update the title, description, and contact info for your app.
 */
export async function generateOpenAPISpec() {
  return generator.generate(contract, {
    info: {
      title: process.env.APP_NAME || "My App API",
      description: "API for your application",
      version: "1.0.0",
      contact: {
        name: "Support",
        email: process.env.EMAIL_FROM_ADDRESS || "support@example.com",
      },
    },
    servers: [
      {
        url: process.env.BETTER_AUTH_URL || "http://localhost:3030",
        description: "API Server",
      },
    ],
    tags: [
      { name: "health", description: "Health check endpoints" },
      { name: "me", description: "Current user endpoints" },
      { name: "tenants", description: "Tenant/group management" },
      { name: "invites", description: "Invitation management" },
      { name: "waitlist", description: "Waitlist signup" },
      { name: "dashboard", description: "Dashboard statistics" },
    ],
  });
}
