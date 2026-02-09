# Multi-Agent Development Skills

Specialized agent skills for collaborative feature development in this cross-platform monorepo.

**Quick start:** Say **"Build me [feature description]"** and the orchestrator coordinates all agents.

## Available Skills

| Skill               | Description                  | Use When                             |
| ------------------- | ---------------------------- | ------------------------------------ |
| `build-feature`     | Orchestrates all agents      | Building complete features           |
| `screen-builder`    | Screen creation workflow     | Creating new screens (ui + routes)   |
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

## Shared Rules (Apply to ALL Skills)

These rules are referenced by individual skills. They are the single source of truth.

### Type Safety

- No `any` types anywhere — use `unknown` with type guards
- No `@ts-nocheck` — fix the types instead
- `@ts-expect-error` only with explanation comment
- Catch blocks: `catch (err: unknown)` not `catch (err: any)`
- Database queries must have typed returns
- Run `pnpm typecheck` before any handoff

### i18n

- ALL user-facing text uses i18n: UI text, error messages, emails, notifications, toasts, validation
- Internal stays English: console logs, analytics events, database fields, code comments
- Add keys to English first (`packages/i18n/src/locales/en/`), then ALL other languages
- API errors use i18n keys: `throwError("FORBIDDEN", "errors.forbidden.noPermission")`
- See `i18n-manager` skill for translation management

### Screens

- ALL screens in `packages/ui/src/screens/{auth,private,public}/`
- Apps only contain thin routing wrappers
- Never create screens in `apps/web/` or `apps/mobile/`

### Error States

Use shared components from `@app/components`:

- `NetworkError` — offline/network errors
- `GeneralError` — API errors (supports `compact` mode for inline)
- `EmptyState` — empty lists with icon, title, message, action
- Presets: `EmptyList`, `EmptySearchResults`, `EmptyNotifications`

### Responsive Design

ALL screens must work on all device sizes using `useWindowDimensions`:

- Small phone (<380px): reduced padding, smaller fonts
- Large phone (380-768px): standard layout
- Tablet/Desktop (≥768px): max-width container, multi-column where appropriate

### Mobile Auth

Mobile MUST pass native `signOut` from `@app/auth/client/native` to shared screens. Web and mobile auth clients are separate Better Auth instances.

## Code Locations

| What                  | Where                                                  |
| --------------------- | ------------------------------------------------------ |
| oRPC Contracts        | `packages/core-contract/src/contracts/`                |
| API Routes (public)   | `apps/api/src/orpc-routes/public/index.ts`             |
| API Routes (private)  | `apps/api/src/orpc-routes/private/index.ts`            |
| API Routes (admin)    | `apps/api/src/orpc-routes/admin/index.ts`              |
| Actions               | `apps/api/src/actions/`                                |
| Database Schema       | `packages/database/src/schema/tables/`                 |
| Shared Screens (auth) | `packages/ui/src/screens/auth/`                        |
| Shared Screens (app)  | `packages/ui/src/screens/private/`                     |
| Shared Hooks          | `packages/ui/src/hooks/`                               |
| Error/Empty States    | `packages/components/src/ErrorStates/`                 |
| Web Routes            | `apps/web/src/app/(private)/` and `(auth)/`            |
| Mobile Routes         | `apps/mobile/src/app/(private)/` and `(auth)/`         |
| Translations          | `packages/i18n/src/locales/{en,es}/`                   |
| Tests                 | `apps/api/src/__tests__/`, `packages/ui/**/__tests__/` |

## Skill Selection Guide

```
I need to...
├── Build a complete feature end-to-end → build-feature (orchestrator)
├── Create a new screen (ui + routes)   → screen-builder
├── Add a single screen/endpoint/table  → building-features
├── Implement API endpoints             → backend-developer
├── Implement web frontend              → web-developer
├── Implement mobile frontend           → mobile-developer
├── Design UI/UX before implementation  → frontend-designer
├── Write tests for implementation      → test-engineer
├── Review code before merge            → code-reviewer
├── Security audit                      → security-reviewer
├── Add translations or new language    → i18n-manager
└── Add feature flags/A/B tests         → feature-flags
```

## Creating New Skills

```yaml
---
name: skill-name
description: Use when [specific trigger conditions]
model: haiku # Optional: model for efficiency
context: fork # Optional: isolated subagent context
allowed-tools: Read, Glob, Grep # Optional: restrict tools
disable-model-invocation: true # Optional: require explicit invocation
---
```

Place in `.claude/skills/<skill-name>/SKILL.md` with YAML frontmatter.
