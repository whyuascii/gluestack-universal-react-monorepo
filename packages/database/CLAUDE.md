# packages/database — Drizzle ORM + PostgreSQL

Database schemas, DTOs (Zod validation), queries, and migrations.

## Structure

```
src/
├── schema/tables/     # Drizzle table definitions (domain-organized)
│   ├── auth/          # user, session, account, verification, jwks
│   ├── tenant/        # tenants, tenant_members, tenant_invites, tenant_activity
│   ├── notifications/ # notifications, deliveries, preferences, targets
│   ├── subscriptions/ # subscriptions, subscription_events
│   ├── features/      # todos, waitlist, user_activity_daily
│   └── admin/         # admin_users, admin_roles, admin_audit_log
├── dto/               # Zod schemas + TypeScript types (domain-organized)
├── queries/           # Type-safe database operations returning DTOs
├── db.ts              # Connection setup (postgres.js, Supabase-compatible)
└── index.ts           # Exports: DTOs, Queries, Tables, db, drizzle utils
drizzle/               # Generated migration SQL files
drizzle.config.ts      # Drizzle Kit configuration
scripts/migrate.ts     # Migration runner
```

## Table Definition Pattern

```typescript
export const todos = pgTable("todos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tenantId: text("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(user, { fields: [todos.userId], references: [user.id] }),
  tenant: one(tenants, { fields: [todos.tenantId], references: [tenants.id] }),
}));
```

## DTO Pattern

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const TodoSchema = createSelectSchema(todos);
export const InsertTodoSchema = createInsertSchema(todos, {
  title: z.string().min(1).max(255),
});
export const CreateTodoDTO = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
});
export type Todo = z.infer<typeof TodoSchema>;
```

## Query Pattern

```typescript
export const TodoQueries = {
  findById: async (id: string): Promise<Todo | null> => {
    const result = await db.query.todos.findFirst({ where: eq(todos.id, id) });
    return result ?? null;
  },
  create: async (data: InsertTodo): Promise<Todo> => {
    const [result] = await db.insert(todos).values(data).returning();
    return result;
  },
};
```

## Export Chain

```
schema/tables/features/todos.ts
  → schema/tables/features/index.ts
  → schema/tables/index.ts
  → schema/index.ts
  → src/index.ts
```

## Migration Workflow

1. Modify schema in `src/schema/tables/`
2. `pnpm --filter database generate` → creates SQL in `drizzle/`
3. Review the generated SQL
4. `pnpm --filter database db:migrate` → applies to database
5. `pnpm typecheck` to verify

## Connection

- Driver: postgres.js (`prepare: false` for Supabase Transaction mode)
- Query logging enabled in development
- Schema preloaded for relational queries

## Rules

- New tables go in `src/schema/tables/<domain>/`
- Always export from barrel files at each level
- Use `$defaultFn(() => crypto.randomUUID())` for IDs
- Use `$onUpdate(() => new Date())` for updatedAt
- Define relations separately using `relations()` function
- Create DTOs with `createSelectSchema`/`createInsertSchema` from drizzle-zod
- Queries return typed DTOs, not raw rows
