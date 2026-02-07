import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "../auth/user";
import { tenants } from "./tenants";

/**
 * Tenant Invites table
 * Tracks pending invitations to join a tenant (group)
 */
export const tenantInvites = pgTable(
  "tenant_invites",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    status: text("status").notNull().default("pending"), // pending, accepted, expired
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("tenant_invites_email_idx").on(table.email),
    index("tenant_invites_token_idx").on(table.token),
    index("tenant_invites_tenant_id_idx").on(table.tenantId),
    index("tenant_invites_tenant_email_unique_idx").on(table.tenantId, table.email),
  ]
);

export const tenantInvitesRelations = relations(tenantInvites, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantInvites.tenantId],
    references: [tenants.id],
  }),
  inviter: one(user, {
    fields: [tenantInvites.invitedBy],
    references: [user.id],
  }),
}));
