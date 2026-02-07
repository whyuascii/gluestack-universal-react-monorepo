/**
 * Database Package
 *
 * Provides typed database access through DTOs and Queries.
 *
 * ## Usage
 *
 * ```typescript
 * import { TenantQueries, type Tenant, type CreateTenant } from "@app/database";
 *
 * // Use queries for database operations
 * const tenant = await TenantQueries.create({ name: "My Team" });
 * const found = await TenantQueries.findById(id);
 * ```
 *
 * ## Exports
 *
 * - **DTOs**: Zod schemas and TypeScript types for all entities
 * - **Queries**: Database operations that return typed DTOs
 * - **Tables**: Raw table definitions (for migrations and advanced usage)
 */

// =============================================================================
// DTOs - Zod schemas and TypeScript types
// =============================================================================
export * from "./dto";

// =============================================================================
// Queries - Database operations returning DTOs
// =============================================================================
export * from "./queries";

// =============================================================================
// Tables - For migrations, Drizzle schema, and auth package
// =============================================================================
export * from "./schema";

// =============================================================================
// Database instance - For internal use and backward compatibility
// @deprecated Use Queries instead of direct db access
// =============================================================================
export { db } from "./db";

// =============================================================================
// Drizzle utilities - For complex queries not covered by Queries
// =============================================================================
export type { InferInsertModel, InferSelectModel } from "drizzle-orm";
export {
  eq,
  and,
  or,
  sql,
  isNull,
  isNotNull,
  desc,
  lt,
  asc,
  gte,
  lte,
  not,
  inArray,
  notInArray,
  count,
  gt,
  ilike,
} from "drizzle-orm";
