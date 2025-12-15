# Database Migrations Guide

This guide covers creating and managing database migrations using Drizzle Kit.

## Quick Reference

```bash
# Generate migration from schema changes
pnpm --filter database generate

# Apply migrations to database
pnpm --filter database db:migrate

# Open Drizzle Studio (database GUI)
pnpm --filter database db:studio

# Seed database with initial data
pnpm --filter database db:seed
```

## Creating a New Table

### 1. Create Schema File

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
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas
export const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(1).max(255),
  content: z.string().optional(),
});

export const selectPostSchema = createSelectSchema(posts);
export const updatePostSchema = insertPostSchema.partial().omit({
  id: true,
  tenantId: true,
  createdAt: true,
});

// Types
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = z.infer<typeof selectPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
```

### 2. Export Schema

```typescript
// packages/database/src/schema/index.ts
export * from "./posts";
```

### 3. Generate Migration

```bash
pnpm --filter database generate
```

This creates a SQL file in `packages/database/drizzle/`:

```sql
-- packages/database/drizzle/2025-12-11_0001_create_posts.sql
CREATE TABLE IF NOT EXISTS "posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "author_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "content" text,
  "published" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "posts" ADD CONSTRAINT "posts_tenant_id_tenants_id_fk"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade;

ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk"
  FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE cascade;
```

### 4. Apply Migration

```bash
pnpm --filter database db:migrate
```

## Modifying Existing Tables

### Adding a Column

```typescript
// Add column to schema
export const posts = pgTable("posts", {
  // ... existing columns
  viewCount: integer("view_count").default(0).notNull(),
});

// Generate and apply migration
pnpm --filter database generate
pnpm --filter database db:migrate
```

### Renaming a Column

Drizzle doesn't support automatic column renames. Manual migration needed:

```sql
-- packages/database/drizzle/2025-12-11_0002_rename_column.sql
ALTER TABLE posts RENAME COLUMN content TO body;
```

## Seeding Data

```typescript
// packages/database/scripts/seed.ts
import { db, tenants, users } from "../src";

async function seed() {
  // Create test tenant
  const [tenant] = await db
    .insert(tenants)
    .values({
      name: "Test Tenant",
      slug: "test-tenant",
    })
    .returning();

  // Create test user
  await db.insert(users).values({
    tenantId: tenant.id,
    email: "test@example.com",
    name: "Test User",
  });

  console.log("Database seeded successfully");
}

seed().catch(console.error);
```

Run with:

```bash
pnpm --filter database db:seed
```

## Best Practices

1. **Always include tenant_id** - For multi-tenant data isolation
2. **Use foreign keys** - Ensure referential integrity
3. **Add indexes** - For frequently queried columns
4. **Default timestamps** - created_at, updated_at with defaults
5. **Validate with Zod** - Add custom validations to schemas
6. **Test migrations** - Apply to dev database before production

## Related Documentation

- [Database Package](../packages/database.md)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
