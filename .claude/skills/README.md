# Multi-Agent Development Skills

This directory contains specialized agent skills for collaborative feature development. These skills encode senior developer knowledge, best practices, and patterns specific to this cross-platform monorepo.

## Quick Start

Say: **"Build me [feature description]"** and the orchestrator will coordinate all agents.

## Available Skills

| Skill               | Description                  | Use When                             |
| ------------------- | ---------------------------- | ------------------------------------ |
| `build-feature`     | Orchestrates all agents      | Building complete features           |
| `building-features` | Feature implementation guide | Adding screens, endpoints, tables    |
| `frontend-designer` | Designs UI/UX                | Need component specs, layouts, flows |
| `backend-developer` | Implements APIs              | Need oRPC contracts, routes, actions |
| `web-developer`     | Implements web frontend      | Need Next.js pages, shared screens   |
| `mobile-developer`  | Implements mobile frontend   | Need Expo screens, native features   |
| `test-engineer`     | Writes tests                 | Need API tests, component tests      |
| `code-reviewer`     | Reviews code quality         | Before merging, after implementation |
| `security-reviewer` | Reviews security             | Auth features, data handling         |
| `feature-flags`     | Feature flags & experiments  | A/B tests, gradual rollouts, surveys |
| `i18n-manager`      | Internationalization         | Adding translations, new languages   |

## Core Principles (Non-Negotiable)

These principles apply to ALL skills and ALL code in this codebase:

### 1. Type Safety First

```typescript
// ❌ NEVER use `any` - it defeats TypeScript's purpose
const data: any = response.body;
catch (err: any) { ... }

// ✅ Use proper types or `unknown` with type guards
const data = response.body as SettingsResponse;
catch (err: unknown) {
  const error = err as { code?: string };
  if (error?.code === "UNAUTHORIZED") { ... }
}

// ❌ NEVER use @ts-nocheck or @ts-ignore without explanation
// @ts-nocheck
export function Component() { ... }

// ✅ If needed, use @ts-expect-error with specific reason
// @ts-expect-error - library types incomplete for ref forwarding
ref={innerRef}
```

### 2. i18n for ALL User-Facing Content

```typescript
// ❌ NEVER hardcode user-facing text
<Button>Submit</Button>
throwError("FORBIDDEN", "You don't have permission");

// ✅ ALWAYS use i18n
<Button>{t("actions.submit")}</Button>
throwError("FORBIDDEN", "errors.forbidden.noPermission");
```

### 3. Screens in packages/ui/src/screens ONLY

```typescript
// ❌ NEVER create screens in apps/web or apps/mobile
// apps/web/src/app/settings/SettingsScreen.tsx  <- WRONG

// ✅ ALL screens go in packages/ui/src/screens/{auth,private,public}/
// packages/ui/src/screens/private/settings/SettingsScreen.tsx <- CORRECT
// apps/web/src/app/(private)/settings/page.tsx <- thin wrapper only
```

### 3b. Use Shared Error States

```typescript
// ❌ NEVER create inline error/empty components
const EmptyState = () => <View><Text>Nothing here</Text></View>;

// ✅ Use @app/components ErrorStates
import { NetworkError, GeneralError, EmptyState, EmptyList } from "@app/components";

if (isOffline) return <NetworkError onRetry={refetch} />;
if (error) return <GeneralError title="Failed" message={error.message} onRetry={refetch} />;
if (!data?.length) return <EmptyList itemName="items" onAdd={handleAdd} />;
```

### 4. Platform-Specific Auth for Mobile

```typescript
// ❌ Mobile without platform auth will have broken logout
<DashboardScreen session={session} />

// ✅ Mobile MUST pass native signOut
import { signOut } from "@app/auth/client/native";
<DashboardScreen session={session} signOut={signOut} />
```

### 5. Responsive Design Required

```typescript
// ❌ Fixed values don't work across devices
<View style={{ padding: 20 }}>

// ✅ Use useWindowDimensions with breakpoints
const { width } = useWindowDimensions();
const padding = width < 380 ? 16 : width >= 768 ? 32 : 20;
```

## The Development Pipeline

```
User Request
    ↓
┌─────────────────┐
│  Orchestrator   │ ← Breaks down requirements
└────────┬────────┘
         ↓
┌─────────────────┐
│    Designer     │ ← Creates UI specifications
└────────┬────────┘
         ↓
┌─────────────────┐
│    Backend      │ ← Implements API
└────────┬────────┘
         ↓
┌────────┴────────┐
│   Web + Mobile  │ ← Implements frontends (parallel)
└────────┬────────┘
         ↓
┌─────────────────┐
│     Tester      │ ← Writes tests
└────────┬────────┘
         ↓
┌─────────────────┐
│    Reviewer     │ ← Code quality check
└────────┬────────┘
         ↓
┌─────────────────┐
│    Security     │ ← Security audit
└────────┬────────┘
         ↓
    Complete!
```

## Example Requests

### Full Feature

```
"Build me a settings page where users can update their profile picture,
display name, and notification preferences"
```

### API Only

```
"Create an API endpoint for exporting user data as JSON"
```

### Frontend Only

```
"Build a dashboard widget showing recent activity"
```

### Quick Fix

```
"Add validation to the email field on the signup form"
```

## Using Individual Skills

You can also invoke individual skills directly:

- **Design only:** "Use frontend-designer to design a settings page"
- **Backend only:** "Use backend-developer to create preference endpoints"
- **Web only:** "Use web-developer to implement the settings page"
- **Mobile only:** "Use mobile-developer to implement the settings screen"
- **Test only:** "Use test-engineer to write tests for the settings API"
- **Review:** "Use code-reviewer to review the settings implementation"
- **Security:** "Use security-reviewer to audit the authentication changes"

## How Agents Communicate

Each agent:

1. Receives context from the orchestrator
2. Reads previous agent's output
3. Produces deliverables in standard locations
4. Provides handoff notes for the next agent

## Code Locations

| What                  | Where                                                  |
| --------------------- | ------------------------------------------------------ |
| oRPC Contracts        | `packages/core-contract/src/contracts/`                |
| API Routes (private)  | `apps/api/src/orpc-routes/private/index.ts`            |
| API Routes (public)   | `apps/api/src/orpc-routes/public/index.ts`             |
| Actions               | `apps/api/src/actions/`                                |
| Database Schema       | `packages/database/src/schema/tables/`                 |
| Shared Screens (auth) | `packages/ui/src/screens/auth/`                        |
| Shared Screens (app)  | `packages/ui/src/screens/private/`                     |
| Shared Hooks          | `packages/ui/src/hooks/`                               |
| Error/Empty States    | `packages/components/src/ErrorStates/`                 |
| Web Routes (private)  | `apps/web/src/app/(private)/`                          |
| Web Routes (auth)     | `apps/web/src/app/(auth)/`                             |
| Mobile Routes         | `apps/mobile/src/app/(private)/` and `(auth)/`         |
| Tests                 | `apps/api/src/__tests__/`, `packages/ui/**/__tests__/` |

## Review Cycles

If reviewers find issues:

1. Issues are documented with file locations
2. Fix agent is dispatched
3. Reviewer re-reviews
4. Cycle continues until approved

## Skip Phases

Tell the orchestrator to skip unnecessary phases:

- "Build API only, skip frontend"
- "Web only, no mobile"
- "Skip design, I have mockups"
- "Quick fix, skip full testing"

## Best Practices

1. **Be specific** - Include all requirements upfront
2. **Provide context** - Reference existing features if relevant
3. **Set scope** - Mention platforms (web, mobile, both)
4. **Note constraints** - Any technical limitations or preferences

## Type Safety Checklist (Run Before Every Commit)

```bash
# Full typecheck across all packages
pnpm typecheck

# If you see errors, fix them. Never:
# - Add @ts-nocheck to bypass
# - Use `any` to silence errors
# - Commit with type errors
```

### Common Type Issues and Fixes

| Issue          | Bad                                     | Good                                                           |
| -------------- | --------------------------------------- | -------------------------------------------------------------- |
| Catch clause   | `catch (err: any)`                      | `catch (err: unknown) { const e = err as { code?: string }; }` |
| Database query | `const result: any = await db.query...` | Type the result properly                                       |
| Component ref  | `// @ts-ignore`                         | `// @ts-expect-error - library types incomplete for ref`       |
| API response   | `response.body as any`                  | `response.body as TypedResponse`                               |
| Form field     | `field: any`                            | `field: FormField` (define minimal interface)                  |

### Files That Commonly Need Type Fixes

- `apps/api/src/actions/*.ts` - Database queries need typed returns
- `packages/ui/src/forms/*.tsx` - Form field types
- `packages/components/src/**/*.tsx` - Ref forwarding types
- `apps/*/src/**/*.tsx` - Error catch blocks

---

## Skill Structure

Each skill follows this structure:

```
skills/
└── skill-name/
    └── SKILL.md    # Main skill document with YAML frontmatter
```

## Creating New Skills

When adding project-specific skills:

1. Create a directory under `.claude/skills/`
2. Add a `SKILL.md` with YAML frontmatter:

```yaml
---
name: skill-name
description: Use when [specific triggering conditions]
---
```

3. Document the workflow, patterns, and verification checklist

## Why Project-Level Skills?

These skills live IN the boilerplate so that:

- Anyone who clones the repo has immediate access
- Skills stay in sync with project structure
- Team members share consistent workflows
- Documentation and guidance travel with the code

## Skill Selection Guide

```
I need to...
│
├── Build a complete feature end-to-end
│   └── Use: `build-feature` (orchestrator)
│
├── Add a single screen/endpoint/table
│   └── Use: `building-features`
│
├── Implement API endpoints
│   └── Use: `backend-developer`
│
├── Implement web frontend
│   └── Use: `web-developer`
│
├── Implement mobile frontend
│   └── Use: `mobile-developer`
│
├── Design UI/UX before implementation
│   └── Use: `frontend-designer`
│
├── Write tests for implementation
│   └── Use: `test-engineer`
│
├── Review code before merge
│   └── Use: `code-reviewer`
│
├── Security audit
│   └── Use: `security-reviewer`
│
├── Add translations or new language
│   └── Use: `i18n-manager`
│
└── Add feature flags/A/B tests
    └── Use: `feature-flags`
```

## Quick Fixes Reference

| Problem                          | Solution                                                                   |
| -------------------------------- | -------------------------------------------------------------------------- |
| `pnpm typecheck` fails           | Fix type errors (no `any`, use `unknown` in catch)                         |
| User sees English hardcoded text | Add i18n key to all locales, use `t()`                                     |
| Mobile logout doesn't work       | Pass `signOut` from `@app/auth/client/native`                              |
| Screen looks bad on iPhone SE    | Add responsive breakpoints with `useWindowDimensions`                      |
| API returns 401 unexpectedly     | Check middleware stack order (auth → tenant → rbac)                        |
| Database query has `any` type    | Add explicit select fields or type the result                              |
| Tests fail with type errors      | Use properly typed mocks matching interfaces                               |
| Inconsistent error/empty states  | Use `@app/components` ErrorStates (NetworkError, GeneralError, EmptyState) |
| Need inline error display        | Use `GeneralError` with `compact` prop                                     |

## Command Cheat Sheet

```bash
# Development
pnpm dev                           # Start all apps
pnpm --filter api dev              # Start API only
pnpm --filter web dev              # Start web only
pnpm --filter mobile dev           # Start mobile only

# Type Checking
pnpm typecheck                     # All packages
pnpm --filter <package> typecheck  # Single package

# Testing
pnpm test                          # All tests
pnpm --filter api test             # API tests

# Database
pnpm --filter database generate    # Generate migration
pnpm --filter database db:migrate  # Apply migration
pnpm --filter database db:studio   # Open Drizzle Studio

# Linting
pnpm lint                          # All packages
pnpm --filter <package> lint:fix   # Fix lint issues
```
