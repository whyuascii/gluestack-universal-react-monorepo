# Database Schema

This document describes the database structure, relationships, and design patterns used in the application.

## Overview

The database uses **PostgreSQL** with **Drizzle ORM** for type-safe queries. The schema follows a **multi-tenant** design where data is isolated by tenant.

**Key Design Principles:**

- Multi-tenant architecture with tenant isolation
- UUID primary keys for all tables
- Timestamps (createdAt, updatedAt) on all entities
- Better Auth integration for authentication tables
- Foreign key constraints for referential integrity

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     tenants     │
│─────────────────│
│ id (PK)         │──┐
│ name            │  │
│ slug            │  │
│ createdAt       │  │
│ updatedAt       │  │
└─────────────────┘  │
                     │
                     │
┌─────────────────┐  │
│     users       │  │
│─────────────────│  │
│ id (PK)         │  │
│ tenantId (FK)   │◄─┘
│ email           │
│ name            │
│ emailVerified   │
│ image           │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
        │
        │ 1:N
        │
┌─────────────────┐
│    sessions     │
│─────────────────│
│ id (PK)         │
│ userId (FK)     │◄──┘
│ expiresAt       │
│ token           │
│ ipAddress       │
│ userAgent       │
└─────────────────┘
```

---

## Core Tables

### tenants

Represents organizations or workspaces in the system.

**Location:** `packages/database/src/schema/tenants.ts`

| Column    | Type      | Constraints       | Description              |
| --------- | --------- | ----------------- | ------------------------ |
| id        | uuid      | PRIMARY KEY       | Unique tenant identifier |
| name      | varchar   | NOT NULL          | Tenant display name      |
| slug      | varchar   | NOT NULL, UNIQUE  | URL-friendly identifier  |
| createdAt | timestamp | NOT NULL, DEFAULT | Tenant creation time     |
| updatedAt | timestamp | NOT NULL, DEFAULT | Last modification time   |

**Indexes:**

- Primary key on `id`
- Unique index on `slug`

**Usage:**

```typescript
import { db } from "database";
import { tenants } from "database/schema";

// Query tenants
const allTenants = await db.select().from(tenants);

// Find by slug
const tenant = await db.select().from(tenants).where(eq(tenants.slug, "acme-corp")).limit(1);
```

### users

User accounts within a tenant.

**Location:** `packages/database/src/schema/users.ts`

| Column        | Type      | Constraints       | Description               |
| ------------- | --------- | ----------------- | ------------------------- |
| id            | uuid      | PRIMARY KEY       | Unique user identifier    |
| tenantId      | uuid      | FOREIGN KEY       | Associated tenant         |
| email         | varchar   | NOT NULL, UNIQUE  | User email address        |
| name          | varchar   |                   | User full name            |
| emailVerified | boolean   | DEFAULT false     | Email verification status |
| image         | varchar   |                   | Profile image URL         |
| createdAt     | timestamp | NOT NULL, DEFAULT | Account creation time     |
| updatedAt     | timestamp | NOT NULL, DEFAULT | Last modification time    |

**Relationships:**

- `tenantId` → `tenants.id` (ON DELETE CASCADE)

**Indexes:**

- Primary key on `id`
- Unique index on `email`
- Index on `tenantId`

**Usage:**

```typescript
import { db } from "database";
import { users, tenants } from "database/schema";

// Get user with tenant
const userWithTenant = await db
  .select()
  .from(users)
  .leftJoin(tenants, eq(users.tenantId, tenants.id))
  .where(eq(users.id, userId));
```

---

## Better Auth Tables

Better Auth manages its own tables for authentication. These are created automatically during migration.

### session

Active user sessions.

| Column    | Type      | Description               |
| --------- | --------- | ------------------------- |
| id        | uuid      | Unique session identifier |
| userId    | uuid      | Associated user           |
| expiresAt | timestamp | Session expiration        |
| token     | varchar   | Session token (hashed)    |
| ipAddress | varchar   | Client IP address         |
| userAgent | varchar   | Client user agent         |

### account

OAuth provider accounts linked to users.

| Column       | Type      | Description                     |
| ------------ | --------- | ------------------------------- |
| id           | uuid      | Unique account identifier       |
| userId       | uuid      | Associated user                 |
| accountId    | varchar   | Provider account ID             |
| providerId   | varchar   | OAuth provider (google, github) |
| accessToken  | varchar   | OAuth access token              |
| refreshToken | varchar   | OAuth refresh token             |
| expiresAt    | timestamp | Token expiration                |

### verification

Email verification tokens.

| Column     | Type      | Description                    |
| ---------- | --------- | ------------------------------ |
| id         | uuid      | Unique verification identifier |
| identifier | varchar   | Email or phone number          |
| value      | varchar   | Verification token/code        |
| expiresAt  | timestamp | Token expiration               |

---

## Multi-Tenant Design

### Tenant Isolation

Data is isolated by `tenantId` foreign key:

```typescript
// All user queries should filter by tenant
const tenantUsers = await db.select().from(users).where(eq(users.tenantId, currentTenantId));
```

### Row-Level Security (Future)

For production deployments, consider enabling PostgreSQL Row-Level Security (RLS):

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see data from their tenant
CREATE POLICY tenant_isolation_policy ON users
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## Schema Versioning

### Migrations

All schema changes are managed through Drizzle migrations:

```bash
# Generate migration
pnpm --filter database generate

# Review migration SQL
cat packages/database/drizzle/0001_migration_name.sql

# Apply migration
pnpm --filter database db:migrate
```

### Migration Best Practices

1. **Never edit migrations** - Create new ones instead
2. **Test migrations** - Run in dev/staging first
3. **Data migrations** - Use separate seed scripts for data changes
4. **Backward compatible** - Add columns as nullable initially
5. **Document breaking changes** - Note in ADR or migration comments

---

## Type Safety

Drizzle automatically generates TypeScript types from schemas:

```typescript
import { users, selectUserSchema, insertUserSchema } from "database/schema";

// Inferred types
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

// Zod validators (auto-generated)
const userData = insertUserSchema.parse({
  email: "user@example.com",
  name: "John Doe",
  tenantId: "...",
});
```

---

## Related Documentation

- **[Database Migrations Guide](../guides/database/migrations.md)** - Creating and managing migrations
- **[Database Package Reference](../reference/packages/database.md)** - Drizzle ORM API
- **[Queries Guide](../guides/database/queries.md)** - Writing type-safe queries
