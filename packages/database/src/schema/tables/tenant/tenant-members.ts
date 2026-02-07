import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "../auth/user";
import { tenants } from "./tenants";

/**
 * Tenant Members table
 * Links users to tenants (families/groups) with two-tier roles:
 *
 * 1. TENANT ROLE (role column) - Management level:
 *    - "owner": Subscription purchaser, full control including billing
 *    - "admin": Co-administrator, full feature access
 *    - "member": Regular member, access controlled by member role
 *
 * 2. MEMBER ROLE (memberRole column) - Functional level (only for members):
 *    - "editor": Full content CRUD
 *    - "viewer": Read-only access
 *    - "contributor": Can create and read, limited updates
 *    - "moderator": Can manage/moderate content created by others
 *
 * Owners and admins bypass member role checks - they have full access.
 * See packages/config/src/rbac/index.ts for permission details.
 */
export const tenantMembers = pgTable(
  "tenant_members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Tenant role: owner, admin, or member (determines management access)
    role: text("role").notNull().default("member"),
    // Member role: editor, viewer, contributor, or moderator
    // Only used when role="member". Owners/admins ignore this.
    // Default to "contributor" for new members (can create/read content)
    memberRole: text("member_role").default("contributor"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("tenant_members_tenant_id_idx").on(table.tenantId),
    index("tenant_members_user_id_idx").on(table.userId),
    index("tenant_members_tenant_user_idx").on(table.tenantId, table.userId),
  ]
);

export const tenantMembersRelations = relations(tenantMembers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantMembers.tenantId],
    references: [tenants.id],
  }),
  user: one(user, {
    fields: [tenantMembers.userId],
    references: [user.id],
  }),
}));
