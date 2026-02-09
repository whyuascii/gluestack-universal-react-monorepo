# API Development Rules

Applies to: `apps/api/**`, `packages/core-contract/**`

- Always define oRPC contracts BEFORE implementing routes
- Business logic goes in `apps/api/src/actions/`, NOT in route handlers
- Use `throwError()` from `lib/errors.ts` — never throw raw Error
- Import `os` from `./_implementer`, NOT from `@orpc/server`
- Middleware order: `authMiddleware` → `tenantMiddleware` → `createRBACMiddleware()` → `requireFeature()`
- Every private route must use at minimum `authMiddleware`
- Export new contracts from `packages/core-contract/src/router.ts`
