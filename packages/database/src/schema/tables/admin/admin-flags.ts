import { pgTable, text, timestamp, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { adminUsers } from "./admin-users";

/**
 * Admin Flag Types
 */
export const adminFlagTypes = [
  "at_risk",
  "vip",
  "do_not_contact",
  "under_review",
  "beta_tester",
  "custom",
] as const;
export type AdminFlagType = (typeof adminFlagTypes)[number];

/**
 * Flag Target Types
 */
export const flagTargetTypes = ["user", "tenant"] as const;
export type FlagTargetType = (typeof flagTargetTypes)[number];

/**
 * Admin Flags Table
 *
 * Support flags on users and tenants (e.g., "at_risk", "vip", "do_not_contact").
 */
export const adminFlags = pgTable(
  "admin_flags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    targetType: text("target_type").$type<FlagTargetType>().notNull(),
    targetId: text("target_id").notNull(),
    flagType: text("flag_type").$type<AdminFlagType>().notNull(),
    customLabel: text("custom_label"),
    reason: text("reason").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => adminUsers.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    unique("admin_flags_unique").on(table.targetType, table.targetId, table.flagType),
    index("admin_flags_target_idx").on(table.targetType, table.targetId),
    index("admin_flags_type_idx").on(table.flagType),
  ]
);

/**
 * Relations for admin flags
 */
export const adminFlagsRelations = relations(adminFlags, ({ one }) => ({
  createdByUser: one(adminUsers, {
    fields: [adminFlags.createdBy],
    references: [adminUsers.id],
  }),
}));

export type AdminFlag = typeof adminFlags.$inferSelect;
export type NewAdminFlag = typeof adminFlags.$inferInsert;
