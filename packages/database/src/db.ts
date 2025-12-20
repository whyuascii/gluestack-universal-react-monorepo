import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Log connection info
console.log("[DATABASE] Connecting with URL:", databaseUrl);

// Disable prefetch/prepare as it is not supported for Supabase "Transaction" pool mode
const client = postgres(databaseUrl, {
  prepare: false,
});

export const db = drizzle(client, {
  schema,
  logger: {
    logQuery: (query: string, params: unknown[]) => {
      console.log("[DATABASE QUERY]", query);
      console.log("[DATABASE PARAMS]", params);
    },
  },
});
