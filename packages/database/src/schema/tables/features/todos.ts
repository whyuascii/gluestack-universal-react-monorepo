import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { user } from "../auth/user";
import { tenants } from "../tenant/tenants";
import { relations } from "drizzle-orm";

/**
 * Todos table
 * A simple CRUD sample for developers to reference
 */
export const todos = pgTable("todos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tenantId: text("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(user, {
    fields: [todos.userId],
    references: [user.id],
  }),
  tenant: one(tenants, {
    fields: [todos.tenantId],
    references: [tenants.id],
  }),
}));
