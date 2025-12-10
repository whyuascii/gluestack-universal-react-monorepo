# Database Package

The `packages/database` package provides type-safe database access using **Drizzle ORM** with **PostgreSQL**.

## Overview

This package is the single source of truth for:
- Database schema definitions
- Zod validation schemas (auto-generated)
- TypeScript types (derived from Zod)
- Database connection singleton
- Migration scripts

## Key Features

- **Type-Safe**: Full TypeScript inference for queries and results
- **Schema-First**: Database schema drives types and validators
- **Zod Integration**: Automatic Zod schema generation via `drizzle-zod`
- **Multitenant Ready**: All tables include `tenant_id` for data isolation
- **Shared Package**: Used by API server, lambdas, and backend services

## Directory Structure

```
packages/database/
├── src/
│   ├── index.ts              # Package exports
│   ├── db.ts                 # Database connection singleton
│   └── schema/               # Table schemas
│       ├── index.ts          # Schema exports
│       ├── tenants.ts        # Tenants table
│       └── users.ts          # Users table (example)
├── drizzle/                  # Generated migrations
│   └── YYYY-MM-DD_*.sql
├── scripts/
│   ├── migrate.ts            # Migration runner
│   └── seed.ts               # Seed script
├── drizzle.config.ts         # Drizzle Kit config
├── package.json
└── tsconfig.json
```

## Usage

### Importing

```typescript
import {
  db,                    // Database connection
  users,                 // Table schemas
  tenants,
  insertUserSchema,      // Zod validators
  selectUserSchema,
  updateUserSchema,
  type User,             // TypeScript types
  type InsertUser,
  type UpdateUser,
  eq, and, or, sql       // Query utilities
} from "database";
```

### Querying

```typescript
// Select all users for a tenant
const allUsers = await db
  .select()
  .from(users)
  .where(eq(users.tenantId, tenantId));

// Insert a user
const newUser = await db
  .insert(users)
  .values({
    tenantId,
    email: "user@example.com",
    name: "John Doe",
  })
  .returning();

// Update a user
await db
  .update(users)
  .set({ name: "Jane Doe" })
  .where(eq(users.id, userId));

// Delete a user
await db
  .delete(users)
  .where(eq(users.id, userId));
```

### Validation

```typescript
import { insertUserSchema } from "database";

// Validate input before insertion
const result = insertUserSchema.safeParse(input);
if (!result.success) {
  // Handle validation errors
  console.error(result.error.issues);
  return;
}

// Use validated data
const newUser = await db.insert(users).values(result.data).returning();
```

## Creating a Schema

Each schema file follows this pattern:

```typescript
// packages/database/src/schema/posts.ts
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tenants } from "./tenants";
import { users } from "./users";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Auto-generate Zod schemas with custom validations
export const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(1).max(255),
  content: z.string().optional(),
});

export const selectPostSchema = createSelectSchema(posts);

export const updatePostSchema = insertPostSchema
  .partial()
  .omit({
    id: true,
    tenantId: true,
    createdAt: true,
    updatedAt: true,
  });

// Export TypeScript types
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = z.infer<typeof selectPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
```

Then export from `schema/index.ts`:

```typescript
export * from "./posts";
```

## Migrations

### Generating Migrations

After modifying schemas:

```bash
pnpm --filter database generate
```

This creates a SQL migration file in `drizzle/`.

### Applying Migrations

```bash
pnpm --filter database db:migrate
```

### Viewing Data

```bash
pnpm --filter database db:studio
```

Opens Drizzle Studio at `https://local.drizzle.studio`

## Environment Variables

The database package requires a `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

## Configuration

### Drizzle Config

`drizzle.config.ts` defines:
- Schema location
- Migration output directory
- Database connection
- SSL settings

### TypeScript Config

Extends `typescript-config/base.json` with Node.js-specific settings.

## Multitenant Pattern

All tables include a `tenant_id` column:

```typescript
export const myTable = pgTable("my_table", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  // ... other columns
});
```

Always filter by `tenantId` in queries:

```typescript
await db
  .select()
  .from(myTable)
  .where(eq(myTable.tenantId, currentTenantId));
```

## Best Practices

1. **Always Use Zod Validation**: Validate all inputs with generated schemas
2. **One Schema Per File**: Keep each table in its own file
3. **Export Everything**: Export table, schemas, and types from each file
4. **Use Transactions**: For multi-table operations, use transactions
5. **Index Properly**: Add indexes for frequently queried columns, especially `tenant_id`

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [drizzle-zod Docs](https://orm.drizzle.team/docs/zod)
- [ADR: Use Drizzle ORM with PostgreSQL](../adr/0001-use-drizzle-orm-with-postgresql.md)
