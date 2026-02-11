# Pull Request Standards

This project follows structured PR conventions to maintain a clean, auditable history and enable automation.

## PR Title Format

PR titles use **uppercase conventional types** followed by a brief description:

```
TYPE(scope): Brief Description of Change
```

Scope is optional. When used, it identifies the affected package or area.

### Types

| Type       | When to Use                             |
| ---------- | --------------------------------------- |
| `FEAT`     | New feature or functionality            |
| `FIX`      | Bug fix                                 |
| `DOCS`     | Documentation only                      |
| `STYLE`    | Formatting, whitespace, no logic change |
| `REFACTOR` | Code restructuring, no behavior change  |
| `TEST`     | Adding or updating tests                |
| `CHORE`    | Maintenance, dependencies, tooling      |
| `PERF`     | Performance improvement                 |
| `CI`       | CI/CD workflow changes                  |
| `BUILD`    | Build system or dependency changes      |

### Examples

```
FEAT(auth): Add multi-tenant RBAC support
FIX(api): Handle expired refresh tokens
DOCS: Update deployment guide
CI: Bump actions/checkout to v6
CHORE(deps): Update Drizzle ORM to v0.35
REFACTOR(ui): Extract notification hooks
PERF(database): Add index on tenant lookup
```

### Commit Messages

Commit messages use **lowercase** [Conventional Commits](https://www.conventionalcommits.org):

```
feat(auth): add multi-tenant RBAC support
fix(api): handle expired refresh tokens
```

This separation is intentional:

- **PR titles** (uppercase) are human-facing, visible in changelogs and release notes
- **Commit messages** (lowercase) follow the Conventional Commits spec for tooling compatibility

## Branch Naming

Use the lowercase type as a prefix:

```
feat/calendar-sharing
fix/auth-refresh-token
refactor/extract-middleware
docs/pr-standards
ci/update-actions
chore/upgrade-dependencies
```

## PR Description

Every PR uses the repository's pull request template. Key sections:

### Required

- **Summary** — What does this change do and why?
- **Type of Change** — Check the relevant box
- **Checklist** — Self-review confirmation

### When Applicable

- **Related Issues** — Link issues with `Fixes #123` or `Related to #456`
- **Screenshots** — Required for any UI change
- **Breaking Changes** — Migration path for consumers
- **Database Changes** — Confirm migrations are created and tested

## PR Size Guidelines

Smaller PRs get reviewed faster and are easier to revert:

| Size      | Lines Changed | Guidance                                   |
| --------- | ------------- | ------------------------------------------ |
| Small     | < 200         | Ideal                                      |
| Medium    | 200-400       | Acceptable                                 |
| Large     | 400-800       | Split if possible                          |
| Too Large | 800+          | Must split unless migration/generated code |

These limits exclude lock files and generated code.

## PR Workflow

1. Create a feature branch from `main`
2. Make changes with lowercase conventional commits
3. Push and open a PR with an uppercase conventional title
4. CI runs automatically — Format Check, Lint, Build, Type Check must pass
5. Request review (or merge directly if you're the repo owner — see [Branch Protection](./BRANCH-PROTECTION.md))
6. Squash merge to keep `main` history clean

## CI Validation

PR titles are validated by [`amannn/action-semantic-pull-request`](https://github.com/amannn/action-semantic-pull-request) in `.github/workflows/pr-check.yml`. Invalid titles will block the PR.

Allowed types: `FEAT`, `FIX`, `DOCS`, `STYLE`, `REFACTOR`, `TEST`, `CHORE`, `PERF`, `CI`, `BUILD`

## Linking Issues

Use GitHub keywords in the PR description to auto-close issues on merge:

```
Fixes #42
Closes #15
Resolves #108
```

Use `Related to #N` for issues that are relevant but shouldn't auto-close.
