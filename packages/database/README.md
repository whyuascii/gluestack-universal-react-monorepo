# @app/database

PostgreSQL database layer using [Drizzle ORM](https://orm.drizzle.team/) with type-safe schemas, DTOs, and queries.

## Structure

```
src/
├── schema/           # Drizzle table definitions
│   └── tables/       # Individual table files
├── dto/              # Zod schemas & TypeScript types
├── queries/          # Database operations
├── db.ts             # Database connection
└── index.ts          # Package exports

drizzle/
├── 0000_initial_schema.sql   # Consolidated migration (new databases)
├── 0001_*.sql - 0017_*.sql   # Incremental migrations (existing databases)
└── meta/                      # Drizzle migration metadata
```

## Quick Start

```typescript
import { TenantQueries, type Tenant, type CreateTenant } from "@app/database";

// Create
const tenant = await TenantQueries.create({ name: "My Team" });

// Read
const found = await TenantQueries.findById(tenant.id);

// Update
const updated = await TenantQueries.update(tenant.id, { name: "New Name" });

// Delete
await TenantQueries.delete(tenant.id);
```

## DTOs

Zod schemas and TypeScript types for all entities, organized by domain:

| Domain            | DTOs                                                                            |
| ----------------- | ------------------------------------------------------------------------------- |
| **Auth**          | User, Session, Account, Verification                                            |
| **Multi-Tenancy** | Tenant, TenantMember, TenantInvite                                              |
| **Notifications** | Notification, NotificationPreferences, NotificationTarget, NotificationDelivery |
| **Features**      | Todo, Waitlist                                                                  |

### Usage

```typescript
import {
  UserSchema, // Zod schema for validation
  InsertUserSchema, // Zod schema for insert
  type User, // TypeScript type
  type InsertUser, // TypeScript insert type
} from "@app/database";

// Validate input
const parsed = InsertUserSchema.parse(input);

// Type annotations
function getUser(id: string): Promise<User | null> {
  return UserQueries.findById(id);
}
```

## Queries

Database operations that return typed DTOs:

| Domain            | Queries                                                       |
| ----------------- | ------------------------------------------------------------- |
| **Auth**          | `UserQueries`                                                 |
| **Multi-Tenancy** | `TenantQueries`, `TenantMemberQueries`, `TenantInviteQueries` |
| **Notifications** | `NotificationQueries`, `NotificationPreferencesQueries`       |
| **Features**      | `TodoQueries`, `WaitlistQueries`                              |

### Query Patterns

```typescript
import { TenantQueries, TenantMemberQueries, NotificationQueries } from "@app/database";

// CRUD operations
await TenantQueries.create({ name: "Team" });
await TenantQueries.findById(id);
await TenantQueries.update(id, { name: "New" });
await TenantQueries.delete(id);

// Relationship queries
await TenantQueries.findByUserId(userId);
await TenantMemberQueries.findByTenantAndUser(tenantId, userId);

// Paginated queries
const { notifications, nextCursor, hasMore } = await NotificationQueries.getInbox(userId, {
  cursor: lastId,
  limit: 20,
});
```

## Migrations

### New Database Setup

Use the consolidated migration for fresh installs:

```bash
# Option 1: Use psql directly
psql $DATABASE_URL -f packages/database/drizzle/0000_initial_schema.sql

# Option 2: Use Drizzle migrate (runs all migrations)
pnpm --filter database db:migrate
```

### Existing Database

Incremental migrations are applied via Drizzle:

```bash
# Apply pending migrations
pnpm --filter database db:migrate

# Push schema changes directly (development only)
pnpm --filter database db:push
```

### Creating Migrations

```bash
# Generate migration from schema changes
pnpm --filter database generate

# This creates drizzle/XXXX_*.sql
```

## Tables Reference

### Auth Tables

- `user` - Core user with preferences and analytics fields
- `session` - User sessions
- `account` - OAuth/social accounts
- `verification` - Email/password verification tokens
- `jwks` - JWT key management

### Multi-Tenancy Tables

- `tenants` - Organizations/groups
- `tenant_members` - User-tenant relationships (two-tier roles)
- `tenant_invites` - Pending invitations

### Notification Tables

- `notifications` - In-app notifications
- `notification_deliveries` - Delivery tracking per channel
- `notification_preferences` - User notification settings
- `notification_targets` - Push tokens and subscriber IDs

### Business Tables

- `todos` - Task management (sample feature)
- `waitlist` - Pre-launch signups
- `subscriptions` - Active subscriptions
- `subscription_events` - Webhook idempotency

### Analytics Tables

- `user_activity_daily` - Per-user daily metrics
- `tenant_activity_daily` - Per-tenant daily metrics

### Admin Tables

- `admin_users`, `admin_roles`, `admin_user_roles` - Admin authentication
- `admin_sessions` - Admin sessions with step-up auth
- `admin_audit_log` - All admin actions
- `admin_flags` - Support flags (VIP, at-risk)
- `admin_impersonation_sessions` - Impersonation tracking
- `admin_user_notes`, `admin_tenant_notes` - Support notes

## Direct Database Access

For complex queries not covered by the Query classes:

```typescript
import { db, eq, and, sql } from "@app/database";
import { tenants, tenantMembers } from "@app/database";

// Complex join
const result = await db
  .select({
    tenantName: tenants.name,
    memberCount: sql<number>`count(*)`,
  })
  .from(tenants)
  .leftJoin(tenantMembers, eq(tenants.id, tenantMembers.tenantId))
  .groupBy(tenants.id);

// Transaction
await db.transaction(async (tx) => {
  await tx.insert(tenants).values({ id, name });
  await tx.insert(tenantMembers).values({ tenantId: id, userId, role: "owner" });
});
```

## Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
```

## Adding a New Table

1. Create table definition in `src/schema/tables/`:

```typescript
// src/schema/tables/my-table.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const myTable = pgTable("my_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

2. Export from `src/schema/tables/index.ts`

3. Create DTO in `src/dto/`:

```typescript
// src/dto/my-table.dto.ts
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { myTable } from "../schema/tables";

export const MyTableSchema = createSelectSchema(myTable);
export const InsertMyTableSchema = createInsertSchema(myTable);
export const UpdateMyTableSchema = InsertMyTableSchema.partial().omit({ id: true });

export type MyTable = z.infer<typeof MyTableSchema>;
export type InsertMyTable = z.infer<typeof InsertMyTableSchema>;
export type UpdateMyTable = z.infer<typeof UpdateMyTableSchema>;
```

4. Export from `src/dto/index.ts`

5. Create queries in `src/queries/`:

```typescript
// src/queries/my-table.queries.ts
import { eq } from "drizzle-orm";
import { db } from "../db";
import { myTable } from "../schema/tables";
import type { MyTable, InsertMyTable, UpdateMyTable } from "../dto";

export const MyTableQueries = {
  findById: async (id: string): Promise<MyTable | null> => {
    const result = await db.query.myTable.findFirst({
      where: eq(myTable.id, id),
    });
    return result ?? null;
  },

  create: async (data: InsertMyTable): Promise<MyTable> => {
    const [result] = await db.insert(myTable).values(data).returning();
    return result;
  },

  update: async (id: string, data: UpdateMyTable): Promise<MyTable> => {
    const [result] = await db.update(myTable).set(data).where(eq(myTable.id, id)).returning();
    return result;
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(myTable).where(eq(myTable.id, id));
  },
};
```

6. Export from `src/queries/index.ts`

7. Generate migration:

```bash
pnpm --filter database generate
```
