# Writing Database Queries

A guide to writing type-safe database queries using Drizzle ORM.

## Prerequisites

- Database package set up
- Understanding of SQL basics
- Familiarity with TypeScript

---

## Basic Queries

### Select All

```typescript
import { db } from "database";
import { users } from "database/schema";

// Get all users
const allUsers = await db.select().from(users);
// Type: User[]
```

### Select Specific Columns

```typescript
// Get only email and name
const userEmails = await db
  .select({
    email: users.email,
    name: users.name,
  })
  .from(users);
// Type: { email: string; name: string | null }[]
```

### Filter with Where

```typescript
import { eq, and, or, like, gt, lt } from "drizzle-orm";

// Find user by email
const user = await db.select().from(users).where(eq(users.email, "user@example.com")).limit(1);

// Multiple conditions (AND)
const activeAdmins = await db
  .select()
  .from(users)
  .where(and(eq(users.role, "admin"), eq(users.active, true)));

// OR conditions
const usersToNotify = await db
  .select()
  .from(users)
  .where(or(eq(users.role, "admin"), eq(users.notifications, true)));

// Pattern matching
const matchingUsers = await db.select().from(users).where(like(users.email, "%@example.com"));
```

---

## Joins

### Inner Join

```typescript
import { users, tenants } from "database/schema";

const usersWithTenants = await db
  .select({
    userId: users.id,
    userName: users.name,
    tenantId: tenants.id,
    tenantName: tenants.name,
  })
  .from(users)
  .innerJoin(tenants, eq(users.tenantId, tenants.id));
```

### Left Join

```typescript
// Include users even without tenant
const allUsersWithOptionalTenant = await db
  .select()
  .from(users)
  .leftJoin(tenants, eq(users.tenantId, tenants.id));
```

### Multiple Joins

```typescript
import { users, tenants, sessions } from "database/schema";

const activeUserSessions = await db
  .select()
  .from(sessions)
  .innerJoin(users, eq(sessions.userId, users.id))
  .innerJoin(tenants, eq(users.tenantId, tenants.id))
  .where(gt(sessions.expiresAt, new Date()));
```

---

## Inserting Data

### Insert Single Row

```typescript
const newUser = await db
  .insert(users)
  .values({
    email: "new@example.com",
    name: "New User",
    tenantId: "...",
  })
  .returning();
// Returns inserted row with generated fields
```

### Insert Multiple Rows

```typescript
const newUsers = await db
  .insert(users)
  .values([
    { email: "user1@example.com", name: "User 1", tenantId: "..." },
    { email: "user2@example.com", name: "User 2", tenantId: "..." },
  ])
  .returning();
```

### Insert with Validation

```typescript
import { insertUserSchema } from "database/schema";

// Validate before insert
const userData = insertUserSchema.parse({
  email: "user@example.com",
  name: "Valid User",
  tenantId: "...",
});

const user = await db.insert(users).values(userData).returning();
```

---

## Updating Data

### Update with Where

```typescript
const updated = await db
  .update(users)
  .set({
    name: "Updated Name",
    updatedAt: new Date(),
  })
  .where(eq(users.id, userId))
  .returning();
```

### Conditional Updates

```typescript
// Update only if conditions match
const result = await db
  .update(users)
  .set({ emailVerified: true })
  .where(and(eq(users.email, userEmail), eq(users.emailVerified, false)));
```

---

## Deleting Data

### Delete with Where

```typescript
await db.delete(users).where(eq(users.id, userId));
```

### Cascade Deletes

Cascade behavior is defined in schema:

```typescript
// In schema definition
export const users = pgTable("users", {
  // ...
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
});
```

---

## Pagination

### Offset-based

```typescript
const page = 1;
const perPage = 20;

const paginatedUsers = await db
  .select()
  .from(users)
  .limit(perPage)
  .offset((page - 1) * perPage);

// Get total count
const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users);
```

### Cursor-based

```typescript
const lastId = "..."; // Last ID from previous page
const pageSize = 20;

const nextPage = await db
  .select()
  .from(users)
  .where(gt(users.id, lastId))
  .orderBy(users.id)
  .limit(pageSize);
```

---

## Transactions

### Basic Transaction

```typescript
await db.transaction(async (tx) => {
  // Create user
  const [user] = await tx
    .insert(users)
    .values({ email: "user@example.com", tenantId: "..." })
    .returning();

  // Create session for user
  await tx.insert(sessions).values({
    userId: user.id,
    token: "...",
    expiresAt: new Date(Date.now() + 86400000),
  });

  // Both succeed or both fail
});
```

### Handling Transaction Errors

```typescript
try {
  await db.transaction(async (tx) => {
    // Operations...
    throw new Error("Rollback!");
  });
} catch (error) {
  console.error("Transaction failed:", error);
  // Transaction was rolled back
}
```

---

## Aggregations

### Count

```typescript
import { sql } from "drizzle-orm";

const [{ count }] = await db
  .select({ count: sql<number>`count(*)` })
  .from(users)
  .where(eq(users.tenantId, tenantId));
```

### Group By

```typescript
const usersByTenant = await db
  .select({
    tenantId: users.tenantId,
    count: sql<number>`count(*)`,
  })
  .from(users)
  .groupBy(users.tenantId);
```

---

## Raw SQL

### For Complex Queries

```typescript
import { sql } from "drizzle-orm";

const result = await db.execute(sql`
  SELECT u.*, t.name as tenant_name
  FROM users u
  JOIN tenants t ON u.tenant_id = t.id
  WHERE u.created_at > ${startDate}
`);
```

---

## Best Practices

### 1. Always Filter by Tenant

```typescript
// ✅ Good: Tenant isolation
const tenantUsers = await db.select().from(users).where(eq(users.tenantId, currentTenantId));

// ❌ Bad: No tenant filter (security risk)
const allUsers = await db.select().from(users);
```

### 2. Use Returning for Inserts/Updates

```typescript
// ✅ Good: Get inserted data
const [user] = await db.insert(users).values(data).returning();

// ❌ Bad: Separate query
await db.insert(users).values(data);
const user = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
```

### 3. Validate Input Data

```typescript
// ✅ Good: Validate before database
const validData = insertUserSchema.parse(input);
await db.insert(users).values(validData);

// ❌ Bad: No validation
await db.insert(users).values(input);
```

### 4. Handle Unique Constraint Violations

```typescript
import { DatabaseError } from "@app/errors";

try {
  await db.insert(users).values({ email: "existing@example.com" });
} catch (error) {
  if (error.code === "23505") {
    // Unique violation
    throw new DatabaseError("Email already exists", 409);
  }
  throw error;
}
```

---

## Performance Tips

### Use Indexes

```typescript
// Define indexes in schema
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    email: varchar("email").notNull(),
    tenantId: uuid("tenant_id").notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    tenantIdx: index("tenant_idx").on(table.tenantId),
  })
);
```

### Select Only Needed Columns

```typescript
// ✅ Good: Select specific columns
const userEmails = await db.select({ email: users.email }).from(users);

// ❌ Bad: Select all columns when not needed
const allData = await db.select().from(users);
```

### Batch Operations

```typescript
// ✅ Good: Single batch insert
await db.insert(users).values(arrayOfUsers);

// ❌ Bad: Loop with individual inserts
for (const user of arrayOfUsers) {
  await db.insert(users).values(user);
}
```

---

## Related Documentation

- **[Database Package Reference](../../reference/packages/database.md)** - Full API reference
- **[Migrations Guide](./migrations.md)** - Schema changes
- **[Database Schema Concepts](../../concepts/database-schema.md)** - Entity relationships
- **[Drizzle ORM Docs](https://orm.drizzle.team/)** - Official documentation
