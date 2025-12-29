import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Verification table for Better Auth
 * Stores email verification tokens and other verification requests
 */
export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// Auto-generated Zod schemas with custom validations
export const insertVerificationSchema = createInsertSchema(verification, {
  identifier: z.string().min(1, "Identifier is required"),
  value: z.string().min(1, "Value is required"),
  expiresAt: z.coerce.date(),
});

export const selectVerificationSchema = createSelectSchema(verification);

// Verification records are typically not updated, only created and deleted
// But we provide this for completeness
export const updateVerificationSchema = insertVerificationSchema.partial().omit({
  id: true,
});

// TypeScript types derived from Zod schemas
export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type Verification = z.infer<typeof selectVerificationSchema>;
export type UpdateVerification = z.infer<typeof updateVerificationSchema>;
