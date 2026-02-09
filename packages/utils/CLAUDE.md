# packages/utils — Shared Utilities

TypeScript type helpers, Zod transforms, and URL utilities.

## Structure

```
src/
├── typescript-utils/   # Type utilities (PartiallyOptional, NestedKeyOf, etc.)
├── zod/                # Zod validation helpers (date transforms, boolean parsing)
└── url-utils/          # URL building with environment-stage-based domains
```

## Key Exports

```typescript
import { PartiallyOptional, PartiallyRequired, NestedKeyOf } from "@app/utils";
import { zodDateTransform, zodBooleanTransform, formatZodErrors } from "@app/utils";
import { buildUrl, getBaseDomain } from "@app/utils";
```

## URL Utils

Uses `environmentStage` pattern (local/staging/production) with a hardcoded `BASE_DOMAIN`. Update `url-utils/index.ts` when changing the deployed domain.

## Notes

- 7 TypeScript type utilities for advanced generic patterns
- 10+ Zod transforms for common validation (dates, booleans, error formatting)
- Tested with Vitest
