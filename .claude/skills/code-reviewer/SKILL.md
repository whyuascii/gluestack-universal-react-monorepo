---
name: code-reviewer
description: Use when reviewing implemented code - checks patterns, performance, accessibility, and code quality before deployment
context: fork
allowed-tools: Read, Glob, Grep, Bash
---

# Code Reviewer

Review code for quality, patterns, performance, and maintainability.

> **Shared rules apply:** See README for type safety, i18n, screens, error states, and responsive design requirements.

## Review Process

1. Understand Context → 2. Check Patterns → 3. Check Performance → 4. Check Accessibility → 5. Check Edge Cases → 6. Summarize Findings

## Review Checklist

### Architecture & Patterns

**API (apps/api)**

- [ ] Contracts define all inputs/outputs with Zod
- [ ] Route handlers are thin (delegate to actions)
- [ ] Actions contain business logic
- [ ] Auth middleware on protected routes (no sentryMiddleware)
- [ ] Errors use `throwError()` with i18n keys

**Frontend (packages/ui)**

- [ ] Shared screens in `packages/ui/src/screens/`
- [ ] Hooks use oRPC client
- [ ] Error/empty states use shared `@app/components`
- [ ] All text uses `useTranslation()`

**Web (apps/web)**

- [ ] Client components marked with "use client"
- [ ] Metadata for SEO
- [ ] Loading/error states

**Mobile (apps/mobile)**

- [ ] Uses shared screens from `@app/ui/screens`
- [ ] Platform-specific auth passed (signOut)
- [ ] Safe area and keyboard handling

### Code Quality

**TypeScript (CRITICAL)**

- [ ] No `any` types — use `unknown` with type guards
- [ ] No `@ts-nocheck` — fix the types instead
- [ ] Catch blocks use `catch (err: unknown)`
- [ ] Database queries have typed returns
- [ ] No type assertions without validation

**React**

- [ ] Hooks follow rules (no conditional hooks)
- [ ] Dependency arrays correct
- [ ] Keys on list items
- [ ] Platform checks use `Platform.OS`, not `typeof window`

### Performance

- [ ] No N+1 queries
- [ ] Pagination on list endpoints
- [ ] Lists virtualized if long
- [ ] No large dependencies imported unnecessarily

### Accessibility

- [ ] Semantic HTML/headings in order
- [ ] Labels on form inputs
- [ ] Alt text on images, ARIA labels on icons
- [ ] Focus management in modals
- [ ] Touch targets 44x44px minimum
- [ ] Contrast ratio 4.5:1 minimum

### Error Handling

- [ ] Uses shared ErrorStates (NetworkError, GeneralError, EmptyState)
- [ ] Loading states while fetching
- [ ] Retry mechanisms for transient failures

## Output Format

```markdown
# Code Review: [Feature Name]

## Summary

[1-2 sentence overview]

## Findings

### 🔴 Critical (must fix before merge)

### 🟠 Important (should fix)

### 🟡 Minor (nice to have)

### 🟢 Suggestions (optional)

## Positives

- [What was done well]

## Verdict

[ ] ✅ Approved
[ ] ⚠️ Approved with minor fixes
[ ] 🔄 Changes requested
```

## When to Block

Block: security vulnerabilities, data loss potential, breaking changes without migration, missing auth on protected routes.

Approve with follow-up: minor performance issues, missing tests, documentation gaps.
