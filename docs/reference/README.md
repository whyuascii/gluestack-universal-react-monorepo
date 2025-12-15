# Reference Documentation

API reference documentation for packages and endpoints. Use this section when you need to look up function signatures, types, or API specifications.

> **Looking for how-to guides?** Check out [../guides/](../guides/) instead.
> **Want to understand the system?** See [../concepts/](../concepts/) for architecture details.

---

## What's in This Section

This section documents **WHAT EXISTS** and **HOW TO USE IT**, not how to build features from scratch.

### 🔌 [API Endpoints](./api-endpoints/)

REST API endpoint specifications:

- Request/response schemas
- Authentication requirements
- Error responses
- Example requests

**Use this when:**

- Integrating with the API
- Understanding API contracts
- Debugging API calls
- Writing API clients

### 📦 [Package APIs](./packages/)

Documentation for shared packages:

- **[Auth](./packages/auth.md)** - Better Auth configuration and clients
- **[Database](./packages/database.md)** - Drizzle schemas, queries, types
- **[Components](./packages/components.md)** - UI component APIs
- **[UI](./packages/ui.md)** - Screens, hooks, and utilities
- **[Utils](./packages/utils.md)** - Utility functions
- **[Errors](./packages/errors.md)** - Error classes
- **[Service Contracts](./packages/service-contracts.md)** - Shared types

**Use this when:**

- Looking up function signatures
- Understanding component props
- Finding available utilities
- Checking type definitions

---

## How to Use Reference Docs

### Quick Lookup

**Finding a function:**

```bash
# Search all reference docs
grep -r "functionName" docs/reference/
```

**Checking types:**

```typescript
// Import and let TypeScript show you
import { SomeType } from "package";
//     ^--- Hover in VS Code to see definition
```

### Understanding Exports

Each package reference doc lists:

- **Main exports** - Primary functions/components
- **Types** - TypeScript interfaces and types
- **Constants** - Exported constants
- **Usage examples** - Common use cases

### API Endpoint Reference

Each endpoint documents:

- **Method and path** - `GET /api/v1/users`
- **Authentication** - Required tokens/headers
- **Request body** - Schema and validation
- **Response** - Success and error responses
- **Examples** - curl and TypeScript examples

---

## Reference vs Guides

| Reference Docs      | Guides                    |
| ------------------- | ------------------------- |
| What exists         | How to accomplish tasks   |
| Function signatures | Step-by-step instructions |
| API specifications  | Implementation strategies |
| Quick lookup        | Learning and tutorials    |
| Assume familiarity  | Assume no knowledge       |

**Example:**

**Reference:** "`signIn.email()` accepts `{ email: string, password: string }` and returns `Promise<Session>`"

**Guide:** "To add login, first set up Better Auth, then create a login form, handle validation, call `signIn.email()`, and redirect on success..."

---

## Contributing to Reference Docs

### When to Update

**Always update reference docs when:**

- Adding new exports to packages
- Changing function signatures
- Modifying API endpoints
- Adding new types or interfaces

### What to Include

**For packages:**

- Function signature
- Parameters and types
- Return type
- Brief description
- Usage example
- Related functions

**For API endpoints:**

- Full path and method
- Auth requirements
- Request schema
- Response schema
- Example request/response
- Error codes

### Documentation Format

**Function reference:**

```markdown
### functionName

Brief description of what it does.

**Signature:**
\`\`\`typescript
function functionName(param1: Type1, param2: Type2): ReturnType
\`\`\`

**Parameters:**

- `param1` (Type1) - Description
- `param2` (Type2) - Description

**Returns:** ReturnType - Description

**Example:**
\`\`\`typescript
const result = functionName("value1", "value2");
\`\`\`
```

---

## Related Documentation

- **[Guides](../guides/)** - Step-by-step tutorials
- **[Concepts](../concepts/)** - System architecture
- **[Getting Started](../getting-started.md)** - Setup and troubleshooting
