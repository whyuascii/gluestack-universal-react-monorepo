Create a database schema change and migration.

Table/change: $ARGUMENTS

Follow these steps:

1. Create or modify schema in `packages/database/src/schema/tables/<name>.ts`
2. Export from `packages/database/src/schema/tables/index.ts`
3. Re-export from `packages/database/src/schema/index.ts`
4. Generate migration: `pnpm --filter database generate`
5. Review the generated SQL migration
6. Apply migration: `pnpm --filter database db:migrate`
7. Run `pnpm typecheck` to verify

Use Drizzle ORM patterns. Reference existing tables in `packages/database/src/schema/tables/` for conventions.
