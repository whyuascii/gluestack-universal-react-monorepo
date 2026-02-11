<!--
PR Title Format (Uppercase Conventional):
  TYPE(scope): Brief Description

Examples:
  FEAT(auth): Add password reset flow
  FIX(api): Resolve database timeout
  DOCS: Update getting started guide
  CI: Bump actions/checkout to v6

Types: FEAT, FIX, DOCS, STYLE, REFACTOR, TEST, CHORE, PERF, CI, BUILD
Scope is optional. See docs/PULL-REQUEST-STANDARDS.md for details.
-->

## Summary

<!-- What does this change do and why? -->

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation
- [ ] Refactor
- [ ] Performance improvement
- [ ] CI/Build
- [ ] Dependencies

## Related Issues

<!-- Link issues: Fixes #123, Closes #456, Related to #789 -->

## Screenshots

<!-- Required for UI changes. Remove section if not applicable. -->

## Breaking Changes

<!-- Describe impact and migration path. Remove section if not applicable. -->

## Checklist

- [ ] Self-reviewed my code
- [ ] Tests added or updated
- [ ] Documentation updated (if needed)
- [ ] No warnings or errors introduced
- [ ] All user-facing text uses i18n

## Database Changes

<!-- Remove section if not applicable -->

- [ ] Migration created (`pnpm --filter database generate`)
- [ ] Migration tested locally (`pnpm --filter database db:migrate`)
- [ ] No breaking changes to existing data
