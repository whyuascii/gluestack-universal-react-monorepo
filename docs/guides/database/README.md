# Database Guides

Step-by-step guides for working with PostgreSQL and Drizzle ORM.

## Available Guides

### [Migrations](./migrations.md)

Creating and managing database schema changes:

- Schema-first development workflow
- Generating migrations from schema
- Applying migrations
- Rolling back changes
- Production migration strategies

**Use this when:**

- Adding new tables or columns
- Modifying existing schema
- Setting up database for first time
- Deploying schema changes

### [Queries](./queries.md)

Writing type-safe database queries with Drizzle:

- Basic CRUD operations
- Joins and relationships
- Filtering and sorting
- Pagination
- Transactions
- Query optimization

**Use this when:**

- Fetching data from database
- Creating/updating records
- Implementing complex queries
- Optimizing slow queries

### [Seeding](./seeding.md)

Populating database with test data:

- Seed script structure
- Data factories
- Generating realistic test data
- Environment-specific seeds
- Resetting database

**Use this when:**

- Setting up local development
- Creating test fixtures
- Populating staging environment
- Generating demo data

## Quick Reference

### Common Tasks

**Create a migration:**

```bash
# 1. Edit schema in packages/database/src/schema/
# 2. Generate migration
pnpm --filter database generate

# 3. Review SQL
cat packages/database/drizzle/0001_*.sql

# 4. Apply migration
pnpm --filter database db:migrate
```

**Query data:**

```typescript
import { db } from "database";
import { users } from "database/schema";
import { eq } from "drizzle-orm";

// Select all users
const allUsers = await db.select().from(users);

// Find specific user
const user = await db.select().from(users).where(eq(users.email, "user@example.com")).limit(1);
```

**Insert data:**

```typescript
const newUser = await db
  .insert(users)
  .values({
    email: "new@example.com",
    name: "New User",
    tenantId: "...",
  })
  .returning();
```

## Database Tools

**Drizzle Studio** - Visual database browser:

```bash
pnpm --filter database db:studio
# Opens at http://localhost:4983
```

**psql** - Command-line interface:

```bash
# Local Docker database
docker exec -it postgres-dev psql -U dev -d dev
```

## Related Documentation

- **[Database Package Reference](../../reference/packages/database.md)** - Schema and API reference
- **[Database Schema Concepts](../../concepts/database-schema.md)** - Entity relationships and design
- **[Drizzle ORM Docs](https://orm.drizzle.team/)** - Official Drizzle documentation
