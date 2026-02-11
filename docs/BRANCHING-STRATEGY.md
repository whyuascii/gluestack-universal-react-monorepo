# Branching Strategy

This project uses a trunk-based development model with optional release branches for hotfixes.

## Branches

```
main                  ← protected, always deployable
release/x.y           ← created only when needed for hotfixes
feat/..., fix/...     ← short-lived, merged via PR to main
```

### main

- Protected branch (see [Branch Protection](./BRANCH-PROTECTION.md))
- All feature work merges here via PR
- release-please monitors this branch and opens Release PRs automatically
- Deployments trigger from `main` after CI passes

### release/x.y

- Created **only** when production needs a patch without shipping unreleased work from `main`
- Accepts only:
  - Cherry-picked bug fixes from `main`
  - Version and changelog bumps
  - Release-only tweaks (rare)
- Named after the minor version: `release/1.2`, `release/2.0`
- Deleted after the patch release is complete

### Feature and Fix Branches

- Short-lived, branched from `main`
- Naming convention: `feat/description`, `fix/description`, `refactor/description`
- Merged to `main` via PR with passing CI
- Deleted after merge

## Day-to-Day Workflow

Normal development — all work flows through `main`:

```
1. git checkout -b feat/calendar-sharing main
2. # make changes, commit with conventional commits
3. git push -u origin feat/calendar-sharing
4. # open PR to main → CI runs → review → squash merge
5. # release-please updates the Release PR on main
6. # merge Release PR when ready to cut a release
```

## Hotfix Workflow

When production (e.g., v1.2.0) needs an urgent fix but `main` has unreleased features:

```
Step 1: Fix on main first
─────────────────────────
  git checkout -b fix/auth-crash main
  # fix the bug, commit
  git push -u origin fix/auth-crash
  # open PR to main → merge

Step 2: Create release branch (if one doesn't exist)
─────────────────────────────────────────────────────
  git checkout -b release/1.2 v1.2.0

Step 3: Cherry-pick the fix
───────────────────────────
  git cherry-pick <commit-hash-from-main>
  # resolve conflicts if any

Step 4: Bump version and tag
────────────────────────────
  # update version in package.json to 1.2.1
  git add package.json
  git commit -m "chore: release 1.2.1"
  git tag v1.2.1
  git push origin release/1.2 --tags

Step 5: Create GitHub Release
─────────────────────────────
  gh release create v1.2.1 --target release/1.2 \
    --title "v1.2.1" \
    --notes "fix: resolve auth crash on token expiry"

Step 6: Clean up
────────────────
  # delete release branch if no more patches expected
  git push origin --delete release/1.2
```

## Why Fix on Main First?

Always land the fix on `main` before cherry-picking to a release branch:

- The fix is tested by CI on `main`
- The fix is included in the next release automatically
- No risk of the fix being lost when the release branch is deleted
- `main` stays the single source of truth

The only exception is when a fix is specific to the release branch and doesn't apply to `main` (very rare).

## Release Types

| Scenario             | Branch        | How                               |
| -------------------- | ------------- | --------------------------------- |
| Normal release       | `main`        | Merge the release-please PR       |
| Hotfix to production | `release/x.y` | Cherry-pick from main, manual tag |
| Pre-release / RC     | `main`        | Tag manually: `v2.0.0-rc.1`       |

## CI Coverage

All branches run the full CI pipeline:

| Workflow                    | main            | release/\* | feat/fix PRs |
| --------------------------- | --------------- | ---------- | ------------ |
| CI (lint, typecheck, build) | Push + PR       | Push + PR  | PR           |
| PR Check (title, conflicts) | —               | —          | PR           |
| Dependency Review           | PR              | PR         | PR           |
| Release Please              | Push            | —          | —            |
| Deploy                      | Push (after CI) | Manual     | —            |

## Rules

1. **Never push directly to `main`** — always use a PR
2. **Never push directly to `release/*`** — use cherry-picks with clear commit messages
3. **Fix on main first** — then cherry-pick to release branches
4. **Delete release branches** when they're no longer needed
5. **One concern per branch** — don't mix features and fixes in a single branch
6. **Keep branches short-lived** — merge within days, not weeks
