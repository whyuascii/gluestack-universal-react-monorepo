---
name: build-feature
description: Use when user requests building a feature, page, or system component - orchestrates multiple specialized agents to deliver complete implementations
disable-model-invocation: true
---

# Feature Build Orchestrator

Coordinate specialized agents to build complete features from a single request.

## Pipeline

1. **Analyze & Plan** — Understand scope, platforms, data models, APIs needed
2. **Design** → `frontend-designer` — Component hierarchy, responsive specs, translation keys
3. **Backend** → `backend-developer` — Contracts, routes, actions, database schema
4. **Frontend** → `web-developer` + `mobile-developer` (parallel) — Shared screens, hooks, platform routes
5. **Testing** → `test-engineer` — API tests, component tests, E2E scenarios
6. **Review** → `code-reviewer` — Patterns, performance, accessibility
7. **Security** → `security-reviewer` — Auth, injection, data exposure

Review/security phases can loop back to backend/frontend if issues found.

## Phase 1: Analyze & Plan

Before dispatching agents:

- What exactly is being built?
- Which platforms? (web-only, mobile-only, both)
- What API endpoints are needed?
- What data models are involved?
- What's the scope? (single page, multi-page flow, full feature)

Create a task list with all phases.

## Agent Dispatch Template

```markdown
## Context

[Feature description and requirements]

## Your Task

[Specific deliverables for this agent]

## Files to Reference

[List relevant existing files]

## Constraints

[Any limitations or requirements]
```

## Coordination Rules

1. **Sequential by default** — each phase completes before the next
2. **Parallel when possible** — web and mobile run in parallel after backend
3. **Review loops** — if reviewers find issues, dispatch fix agents
4. **Single source of truth** — contracts define the API, all agents follow them
5. **Shared components first** — build in `packages/ui` before platform code

## Quick Builds

Skip unnecessary phases for narrower requests:

| Request Type     | Skip Phases                   |
| ---------------- | ----------------------------- |
| API-only         | Design, Frontend              |
| UI-only (no API) | Backend                       |
| Web-only         | Mobile                        |
| Mobile-only      | Web                           |
| Hotfix           | Design, Testing (manual test) |

## Type Safety Gate

Before marking ANY phase complete: `pnpm typecheck` must pass. No `any`, no `@ts-nocheck`.

## Red Flags

Never:

- Skip the planning phase
- Dispatch agents without clear requirements
- Let agents make conflicting decisions
- Skip security review for auth-related features
- Build non-responsive screens
- Hardcode user-facing text
- Omit platform-specific auth handling (mobile signOut)
