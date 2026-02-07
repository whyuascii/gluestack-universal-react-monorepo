import fs from "node:fs";
import { generateOpenAPISpec } from "./lib/openapi";

/**
 * Generate OpenAPI specification to file
 *
 * Usage: pnpm --filter api swagger
 */
const main = async () => {
  try {
    console.info("Generating OpenAPI specification...");
    const spec = await generateOpenAPISpec();
    console.info("Writing to openapi.json...");
    fs.writeFileSync("openapi.json", JSON.stringify(spec, null, 2));
    console.info("Done! OpenAPI spec written to openapi.json");
  } catch (e) {
    console.error("Failed to generate OpenAPI spec:", e);
    process.exit(1);
  }
};

main();
