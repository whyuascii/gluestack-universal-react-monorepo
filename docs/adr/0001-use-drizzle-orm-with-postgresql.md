# 0001 - Use Drizzle ORM with PostgreSQL

- **Status**: Accepted
- **Date**: 2024-12-09
- **Decision Makers**: Architecture Team
- **Supersedes**: N/A
- **Superseded by**: N/A

## Context

The monorepo needed a database solution that would:
- Provide type-safe database access
- Support both backend services (API) and serverless functions
- Enable schema-first development with migrations
- Integrate well with TypeScript and Zod for validation
- Work efficiently with a multitenant SaaS architecture

## Decision

We will use **Drizzle ORM** with **PostgreSQL** as our database layer.

The database will be implemented as a shared package (`packages/database`) that:
- Defines all table schemas using Drizzle's type-safe schema builder
- Automatically generates Zod validators using `drizzle-zod`
- Exports TypeScript types derived from Zod schemas
- Provides a singleton database connection
- Supports migrations via Drizzle Kit

## Rationale

This decision was made because:

1. **Type Safety**: Drizzle provides excellent TypeScript inference, catching errors at compile time
2. **Schema-First Development**: Database schema becomes the single source of truth for types and validators
3. **Zod Integration**: `drizzle-zod` automatically generates Zod schemas from table definitions, eliminating duplicate validation logic
4. **Performance**: Drizzle is lightweight and has minimal runtime overhead
5. **SQL-Like Syntax**: The query builder is close to SQL, making it easy to write complex queries
6. **Migration Support**: Drizzle Kit provides robust migration generation and management
7. **Multitenant Ready**: PostgreSQL with proper indexing supports the multitenant pattern well

## Consequences

### Positive

- Single source of truth for schemas, types, and validation
- Excellent developer experience with autocomplete and type checking
- Reduced boilerplate compared to writing separate validators
- Clear separation of database concerns in a shared package
- Easy to mock for testing

### Negative

- Team needs to learn Drizzle's query syntax
- Smaller ecosystem compared to Prisma or TypeORM
- Less community resources and examples available

### Neutral

- Database package must be updated for schema changes
- Migrations need to be run manually or through scripts
- All backend services share the same database connection logic

## Alternatives Considered

### Alternative 1: Prisma

**Pros:**
- Larger ecosystem and community
- Excellent tooling and developer experience
- Built-in migration system

**Cons:**
- Heavier runtime overhead
- Less flexible query builder
- Zod integration requires additional tools

**Why not chosen:** Drizzle's lightweight nature and direct Zod integration were more aligned with our needs.

### Alternative 2: TypeORM

**Pros:**
- Mature and battle-tested
- Decorator-based syntax familiar to backend developers
- Large community

**Cons:**
- Decorator syntax doesn't align with our functional approach
- Less TypeScript-first compared to Drizzle
- Zod integration would require manual work

**Why not chosen:** Drizzle's modern TypeScript-first approach was preferred.

### Alternative 3: Raw SQL with Manual Types

**Pros:**
- Maximum control and flexibility
- No ORM overhead
- Can optimize every query

**Cons:**
- Manual type management is error-prone
- No automatic validation generation
- Significant boilerplate
- Harder to maintain

**Why not chosen:** The maintenance burden and lack of type safety made this impractical.

## Implementation Notes

- Database connection is initialized in `packages/database/src/db.ts`
- All schemas are in `packages/database/src/schema/`
- Each schema file exports: table schema, Zod validators, and TypeScript types
- Migrations are stored in `packages/database/drizzle/`
- Use `pnpm --filter database generate` to create migrations
- Use `pnpm --filter database db:migrate` to apply migrations

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [drizzle-zod Documentation](https://orm.drizzle.team/docs/zod)
- [Database Package README](../packages/database.md)

## Revision History

| Date       | Author | Changes |
|------------|--------|---------|
| 2024-12-09 | Claude | Initial draft |
