# Database Guide

Complete reference for Drizzle ORM and PostgreSQL in this boilerplate.

## Overview

Database layer is powered by [Drizzle ORM](https://orm.drizzle.team), providing:

- Type-safe SQL queries
- Auto-generated Zod validators
- Migration management
- Visual database browser (Drizzle Studio)

## Architecture

```
packages/database/
├── src/
│   ├── db.ts              # Database connection
│   ├── schema/
│   │   ├── index.ts       # All schema exports
│   │   ├── auth/          # Better Auth tables
│   │   │   ├── user.ts
│   │   │   ├── session.ts
│   │   │   ├── account.ts
│   │   │   └── verification.ts
│   │   ├── tenants.ts     # Multi-tenancy
│   │   ├── waitlist.ts    # Example table
│   │   └── ...
│   └── index.ts           # Main exports
├── drizzle/               # Migrations
│   ├── 0000_xxx.sql
│   ├── 0001_xxx.sql
│   └── meta/
└── drizzle.config.ts      # Drizzle configuration
```

## Configuration

### Environment Variables

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Connection

**File:** `packages/database/src/db.ts`

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

## Defining Schemas

### Basic Table

```typescript
// packages/database/src/schema/posts.ts
import { pgTable, uuid, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Auto-generate Zod schemas
export const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(1).max(255),
});
export const selectPostSchema = createSelectSchema(posts);

// Derive types
export type Post = z.infer<typeof selectPostSchema>;
export type NewPost = z.infer<typeof insertPostSchema>;
```

### With Relations

```typescript
// packages/database/src/schema/posts.ts
import { relations } from "drizzle-orm";
import { users } from "./auth/user";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  // ...
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));
```

### Export from Index

```typescript
// packages/database/src/schema/index.ts
export * from "./auth/user";
export * from "./auth/session";
export * from "./auth/account";
export * from "./auth/verification";
export * from "./tenants";
export * from "./posts"; // Add new schemas here
```

## Migrations

### Generate Migration

After modifying schemas:

```bash
pnpm db:generate
```

This creates a new SQL file in `packages/database/drizzle/`.

### Review Migration

Always review generated migrations before applying:

```sql
-- drizzle/0001_cool_name.sql
CREATE TABLE IF NOT EXISTS "posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(255) NOT NULL,
  "content" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

### Apply Migration

```bash
pnpm db:migrate
```

### Drizzle Studio

Visual database browser:

```bash
pnpm db:studio
```

Opens at `http://localhost:4983`.

## Querying Data

### Select

```typescript
import { db } from "@app/database";
import { posts } from "@app/database/schema";
import { eq, and, desc, like } from "drizzle-orm";

// Get all posts
const allPosts = await db.select().from(posts);

// Get by ID
const post = await db.select().from(posts).where(eq(posts.id, "uuid-here")).limit(1);

// With conditions
const publishedPosts = await db
  .select()
  .from(posts)
  .where(and(eq(posts.published, true), like(posts.title, "%TypeScript%")))
  .orderBy(desc(posts.createdAt));
```

### Insert

```typescript
// Single insert
const [newPost] = await db
  .insert(posts)
  .values({
    title: "Hello World",
    content: "My first post",
    userId: user.id,
  })
  .returning();

// Bulk insert
await db.insert(posts).values([
  { title: "Post 1", userId: user.id },
  { title: "Post 2", userId: user.id },
]);
```

### Update

```typescript
const [updatedPost] = await db
  .update(posts)
  .set({
    title: "Updated Title",
    updatedAt: new Date(),
  })
  .where(eq(posts.id, postId))
  .returning();
```

### Delete

```typescript
await db.delete(posts).where(eq(posts.id, postId));
```

### With Relations

```typescript
// Get post with author
const postWithAuthor = await db.query.posts.findFirst({
  where: eq(posts.id, postId),
  with: {
    author: true,
  },
});

// Get user with all posts
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    posts: {
      orderBy: desc(posts.createdAt),
      limit: 10,
    },
  },
});
```

## Common Patterns

### Pagination

```typescript
async function getPaginatedPosts(page: number, pageSize: number = 10) {
  const offset = (page - 1) * pageSize;

  const [data, countResult] = await Promise.all([
    db.select().from(posts).orderBy(desc(posts.createdAt)).limit(pageSize).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(posts),
  ]);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total: countResult[0].count,
      totalPages: Math.ceil(countResult[0].count / pageSize),
    },
  };
}
```

### Soft Delete

```typescript
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  // ...
  deletedAt: timestamp("deleted_at"),
});

// "Delete" by setting timestamp
await db.update(posts).set({ deletedAt: new Date() }).where(eq(posts.id, postId));

// Query only non-deleted
const activePosts = await db.select().from(posts).where(isNull(posts.deletedAt));
```

### Transactions

```typescript
import { db } from "@app/database";

await db.transaction(async (tx) => {
  // Create post
  const [post] = await tx.insert(posts).values({ title: "New Post", userId }).returning();

  // Update user post count
  await tx
    .update(users)
    .set({ postCount: sql`${users.postCount} + 1` })
    .where(eq(users.id, userId));

  // If anything fails, both operations roll back
});
```

### Computed Columns

```typescript
import { sql } from "drizzle-orm";

const usersWithPostCount = await db
  .select({
    id: users.id,
    name: users.name,
    postCount: sql<number>`(
      SELECT COUNT(*) FROM posts WHERE posts.user_id = users.id
    )`,
  })
  .from(users);
```

### Full-Text Search

```typescript
// Create GIN index in migration
// CREATE INDEX posts_search_idx ON posts USING gin(to_tsvector('english', title || ' ' || content));

const searchResults = await db.select().from(posts).where(sql`
    to_tsvector('english', ${posts.title} || ' ' || ${posts.content})
    @@ plainto_tsquery('english', ${searchQuery})
  `);
```

## Multi-Tenancy

### Tenant Schema

```typescript
// packages/database/src/schema/tenants.ts
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tenantMembers = pgTable("tenant_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: varchar("role", { length: 50 }).default("member"),
});
```

### Tenant-Scoped Queries

```typescript
// Always filter by tenant
async function getTenantPosts(tenantId: string) {
  return db.select().from(posts).where(eq(posts.tenantId, tenantId));
}

// Middleware to inject tenant
function withTenant(tenantId: string) {
  return {
    posts: {
      findMany: () => db.select().from(posts).where(eq(posts.tenantId, tenantId)),
      create: (data: NewPost) =>
        db
          .insert(posts)
          .values({ ...data, tenantId })
          .returning(),
    },
  };
}
```

## Type Safety

### End-to-End Types

```typescript
// Schema generates types
import type { Post, NewPost } from "@app/database/schema";

// Use in API
fastify.post("/posts", async (request) => {
  const data: NewPost = insertPostSchema.parse(request.body);
  const post: Post = await createPost(data);
  return post;
});

// Use in UI
import type { Post } from "@app/database/schema";

function PostCard({ post }: { post: Post }) {
  return <div>{post.title}</div>;
}
```

### Zod Validation

```typescript
// Validate API input
const createPostSchema = insertPostSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

fastify.post("/posts", async (request) => {
  const data = createPostSchema.parse(request.body);
  // data is fully typed
});
```

## Performance

### Indexes

```typescript
// In schema
export const posts = pgTable(
  "posts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("posts_user_id_idx").on(table.userId),
    createdAtIdx: index("posts_created_at_idx").on(table.createdAt),
  })
);
```

### Connection Pooling

For serverless, use connection pooling:

```typescript
// Supabase pooler
DATABASE_URL=postgresql://postgres.[ref]:pass@aws-0-region.pooler.supabase.com:6543/postgres

// Or use PgBouncer
```

### Query Optimization

```typescript
// Select only needed columns
const titles = await db.select({ title: posts.title }).from(posts);

// Use explain for debugging
const explained = await db.execute(sql`
  EXPLAIN ANALYZE
  SELECT * FROM posts WHERE user_id = ${userId}
`);
```

## Testing

### Test Database

```typescript
// Use separate test database
process.env.DATABASE_URL = "postgresql://...test_db";

beforeEach(async () => {
  await db.delete(posts); // Clean tables
});

afterAll(async () => {
  await client.end(); // Close connection
});
```

### Factories

```typescript
// test/factories/post.ts
import { faker } from "@faker-js/faker";

export function createTestPost(overrides?: Partial<NewPost>): NewPost {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(),
    userId: faker.string.uuid(),
    ...overrides,
  };
}
```

## Troubleshooting

### Connection errors

1. Check `DATABASE_URL` format
2. Verify database is running
3. Check network/firewall settings
4. For Supabase, ensure project is active

### Migration errors

1. Check for syntax errors in SQL
2. Ensure schema matches migration
3. Try `pnpm db:generate` to regenerate

### Type errors

1. Run `pnpm db:generate` after schema changes
2. Restart TypeScript server
3. Check imports are from `@app/database/schema`

## Best Practices

1. **Schema-first development** - Define schema, then generate types
2. **Always use transactions** - For multi-table operations
3. **Index foreign keys** - Improves join performance
4. **Use connection pooling** - Essential for serverless
5. **Validate at the edge** - Use Zod schemas for API input
6. **Review migrations** - Before applying to production
7. **Soft delete when appropriate** - Preserve data integrity

## Next Steps

- **[API.md](./API.md)** - Use database in API routes
- **[../BUILDING-FEATURES.md](../BUILDING-FEATURES.md)** - Full feature workflow
- **[Drizzle Docs](https://orm.drizzle.team/docs)** - Official documentation
