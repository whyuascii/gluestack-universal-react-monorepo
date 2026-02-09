Create a new API endpoint following the monorepo convention.

Endpoint: $ARGUMENTS

Follow these steps in order:

1. Define oRPC contract in `packages/core-contract/src/contracts/private/features.ts` (or appropriate file)
2. Export from `packages/core-contract/src/router.ts`
3. Create action class in `apps/api/src/actions/<name>.ts` with business logic
4. Add route handler in `apps/api/src/orpc-routes/private/index.ts` with appropriate middleware
5. Create query/mutation hook in `packages/ui/src/hooks/`
6. Run `pnpm typecheck` to verify

Use the `backend-developer` skill for detailed patterns. Reference existing patterns in `apps/api/src/actions/me.ts` and `apps/api/src/orpc-routes/private/index.ts`.
