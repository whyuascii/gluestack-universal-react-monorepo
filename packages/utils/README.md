# Utils

Isomorphic utility functions for TypeScript, Zod validation, and URL building. These utilities work in both browser and Node.js environments with no platform-specific dependencies.

## Installation

This package is internal to the monorepo:

```typescript
import { transformDate, isString, buildUrl } from "@app/utils";
```

## When to Add Utilities Here

**Do add:**

- Functions used across multiple packages (API + UI, etc.)
- Isomorphic code (works in browser and Node.js)
- Pure utility functions without side effects

**Don't add:**

- Workspace-specific code (keep in that workspace's `utils/` folder)
- Business logic
- Database/API code
- React components or hooks
- Platform-specific code (web-only, mobile-only)

## Available Utilities

### TypeScript Utilities (`typescript-utils/`)

**Type Manipulation:**

```typescript
import type {
  PartiallyOptional,
  PartiallyRequired,
  PartiallyNullable,
  RemoveNullable,
  NonUndefined,
  NestedKeyOf,
} from "@app/utils";

interface User {
  id: string;
  name: string;
  email: string;
  settings: { theme: string; notifications: boolean };
}

// Make some fields optional
type UserInput = PartiallyOptional<User, "id">;

// Make some fields required on a partial type
type RequiredEmail = PartiallyRequired<Partial<User>, "email">;

// Allow null on specific fields
type NullableName = PartiallyNullable<User, "name">;

// Remove null from specific fields
type NonNullEmail = RemoveNullable<User, "email">;

// Generate nested key paths
type UserKeys = NestedKeyOf<User, "settings">;
// "id" | "name" | "email" | "settings" | "settings.theme" | "settings.notifications"
```

**Type Guards:**

```typescript
import {
  isString,
  isBoolean,
  isArray,
  isDate,
  isRecord,
  isValidISODate,
  isValidJSONString,
} from "@app/utils";

// Runtime type checking
if (isString(value)) {
  // value is typed as string
}

if (isRecord(value)) {
  // value is typed as Record<string, unknown>
}

// Validation helpers
isValidISODate("2024-01-01T00:00:00Z"); // true
isValidJSONString('{"key": "value"}'); // true
```

### Zod Utilities (`zod/`)

**Date Transforms:**

```typescript
import { z } from "zod";
import {
  transformDate,
  transformNullishDate,
  transformDateToUTC,
  transformDateToUTCString,
} from "@app/utils";

// String to Date
const schema = z.object({
  createdAt: transformDate, // "2024-01-01" -> Date
  deletedAt: transformNullishDate, // null | undefined | "2024-01-01" -> Date | null
  scheduledAt: transformDateToUTC, // Converts to UTC Date
  expiresAt: transformDateToUTCString, // Converts to UTC ISO string
});
```

**Boolean & String Transforms:**

```typescript
import {
  transformToBoolean,
  transformEmptyStringToNull,
  transformStringToBoolean,
} from "@app/utils";

// Parse "true"/"false" strings (case insensitive)
const boolSchema = z.object({
  enabled: transformToBoolean, // "TRUE" -> true, "false" -> false
});

// Empty string to null
const stringSchema = z.object({
  nickname: transformEmptyStringToNull, // "" -> null
});

// For query params
const querySchema = z.object({
  active: transformStringToBoolean, // "true" -> true (optional)
});
```

**Array & Sort Helpers:**

```typescript
import { transformStringToArray, sortStringSchema } from "@app/utils";

// Single value to array
const arraySchema = transformStringToArray(z.string());
// "item" -> ["item"]
// ["a", "b"] -> ["a", "b"]

// Parse sort strings (for API queries)
const listSchema = z.object({
  sort: sortStringSchema.optional(),
});

const result = listSchema.parse({ sort: "asc(name),desc(createdAt)" });
// result.sort = { name: 1, createdAt: -1 }
```

**Error Formatting:**

```typescript
import { transformValidationErrorMessages } from "@app/utils";

try {
  schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    const formatted = transformValidationErrorMessages(error.issues);
    // [{ index: 0, path: ["email"], message: "Invalid email" }]
  }
}
```

### URL Utilities (`url-utils/`)

Build URLs based on environment stage:

```typescript
import { buildUrl, buildDomainUrl } from "@app/utils";

// Build full URL
buildUrl({
  environmentStage: "production",
  subdomain: "api",
  path: "/users",
});
// "https://api.demo-app.com/users"

buildUrl({
  environmentStage: "staging",
  path: "/health",
});
// "https://staging.demo-app.com/health"

buildUrl({
  environmentStage: "local",
  path: "/api",
});
// "http://localhost:3000/api"

// Just the domain
buildDomainUrl({ environmentStage: "production" });
// "demo-app.com"

buildDomainUrl({ environmentStage: "staging", subdomain: "api" });
// "api.staging.demo-app.com"
```

> **Note:** The base domain is configured in `url-utils/index.ts`. Update `BASE_DOMAIN` and `LOCAL_PORT` for your application.

## Adding New Utilities

1. Create a directory under `src/` for the category (e.g., `string-utils/`)
2. Add an `index.ts` that exports all utilities
3. Export from `src/index.ts`
4. Add tests in a `.test.ts` file
5. Run `pnpm --filter utils test` to verify

## Scripts

```bash
pnpm --filter utils build      # Build the package
pnpm --filter utils test       # Run tests
pnpm --filter utils typecheck  # Type check
pnpm --filter utils lint       # Lint
```
