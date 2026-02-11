# Versioning and Changelog

This project uses [Semantic Versioning](https://semver.org) with automated releases via [release-please](https://github.com/googleapis/release-please).

## How It Works

1. You merge PRs to `main` with conventional commit messages
2. release-please automatically opens a **Release PR** that accumulates all changes
3. The Release PR updates `CHANGELOG.md` and bumps the version in `package.json`
4. When you merge the Release PR, release-please tags the version and creates a GitHub Release

You never manually edit `CHANGELOG.md` or version numbers.

## Version Bumps

Versions follow [SemVer](https://semver.org) — `MAJOR.MINOR.PATCH`:

| Commit Type                                 | Version Bump | Example       |
| ------------------------------------------- | ------------ | ------------- |
| `fix:`                                      | **Patch**    | 1.0.0 → 1.0.1 |
| `feat:`                                     | **Minor**    | 1.0.0 → 1.1.0 |
| `feat!:` or `BREAKING CHANGE`               | **Major**    | 1.0.0 → 2.0.0 |
| `docs:`, `chore:`, `ci:`, `style:`, `test:` | No bump      | —             |
| `perf:`, `refactor:`                        | **Patch**    | 1.0.0 → 1.0.1 |

Breaking changes are indicated by either:

- An `!` after the type: `feat!: remove legacy API`
- A `BREAKING CHANGE` footer in the commit body

## Changelog Sections

The generated `CHANGELOG.md` groups entries by type:

| Section       | Included Types | Visible |
| ------------- | -------------- | ------- |
| Features      | `feat`         | Yes     |
| Bug Fixes     | `fix`          | Yes     |
| Performance   | `perf`         | Yes     |
| Refactoring   | `refactor`     | Yes     |
| Documentation | `docs`         | Hidden  |
| Maintenance   | `chore`        | Hidden  |
| CI/CD         | `ci`           | Hidden  |
| Tests         | `test`         | Hidden  |

Hidden sections are still tracked but don't clutter the changelog for users.

## Release Workflow

```
main ← PR merged (feat: add calendar sharing)
  │
  └─ release-please opens/updates Release PR:
       title: "chore(main): release 1.1.0"
       body: updated CHANGELOG.md preview
       files: package.json, CHANGELOG.md
  │
  └─ You merge the Release PR when ready
       → Git tag v1.1.0 created
       → GitHub Release published
       → CHANGELOG.md committed
```

Multiple PRs can accumulate before you merge the Release PR. This lets you batch changes into a single release.

## Configuration

| File                            | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `release-please-config.json`    | Release type, changelog sections, package mapping |
| `.release-please-manifest.json` | Current version tracker (updated automatically)   |
| `.github/workflows/release.yml` | GitHub Actions workflow that runs release-please  |

## First Release

The manifest starts at `1.0.0`. After you merge this setup:

1. release-please will open a Release PR for the next version
2. Merge it to publish your first automated release
3. All subsequent merges to `main` will update the Release PR automatically

## Breaking Changes

To trigger a major version bump, use either format in your **commit message**:

```
feat!: redesign authentication flow

BREAKING CHANGE: The auth API now requires tenant context.
Migrate by wrapping auth calls with tenantMiddleware.
```

Or simply:

```
feat!: drop support for Node 18
```

## Important Notes

- Squash merge uses the PR title as the commit message. release-please is configured to recognize both uppercase (`FEAT:`) and lowercase (`feat:`) types, so either format works.
- The Release PR is long-lived — it stays open and updates as new commits land on `main`.
- You control when to release by choosing when to merge the Release PR.
- Merging the Release PR does not trigger a deploy — it only creates the tag and GitHub Release.
