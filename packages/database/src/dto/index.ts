/**
 * Database DTOs (Data Transfer Objects)
 *
 * Zod schemas and TypeScript types organized by domain.
 *
 * Each entity has:
 * - Schema: Zod schema for select (full row)
 * - InsertSchema: Zod schema for insert
 * - UpdateSchema: Zod schema for update (partial)
 * - Types: TypeScript types inferred from schemas
 */

// =============================================================================
// Auth Domain
// =============================================================================
export * from "./auth";

// =============================================================================
// Multi-Tenancy Domain
// =============================================================================
export * from "./tenant";

// =============================================================================
// Notifications Domain
// =============================================================================
export * from "./notifications";

// =============================================================================
// Features Domain (Sample/Reference)
// =============================================================================
export * from "./features";
