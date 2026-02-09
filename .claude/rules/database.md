# Database Rules

Applies to: `packages/database/**`

- Define schemas in `src/schema/tables/` — one file per entity
- Export tables from `src/schema/tables/index.ts` → re-export from `src/schema/index.ts`
- After schema changes: `pnpm --filter database generate` → `pnpm --filter database db:migrate`
- Use Drizzle relations for type-safe joins
- All queries must have typed returns — no `any`
- Use `$defaultFn(() => createId())` for IDs, `$defaultFn(() => new Date())` for timestamps
- Reference auth tables via `users` from Better Auth schema — don't duplicate
