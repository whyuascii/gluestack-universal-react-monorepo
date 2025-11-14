// Export database instance
export { db } from "./db";

// Export all schemas, Zod validators, and types
export * from "./schema";

// Re-export useful Drizzle types and utilities
export type { InferInsertModel, InferSelectModel } from "drizzle-orm";
export { eq, and, or, sql } from "drizzle-orm";
