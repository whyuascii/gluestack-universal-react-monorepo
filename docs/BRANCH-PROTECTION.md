# Branch Protection

This guide explains how to set up branch protection on `main` to enforce a pull request workflow, and why it matters for open-source projects.

## Why Protect Main?

Pushing directly to `main` is risky for any project with contributors:

- **No CI validation** — broken code can land on main without passing tests, lint, or type checks
- **No review trail** — changes lack context for future contributors asking "why was this changed?"
- **No rollback safety** — direct pushes are harder to isolate and revert than merged PRs
- **Contributor trust** — contributors expect that their PRs go through the same process as maintainer changes

Branch protection ensures every change to `main` goes through a PR with passing CI, creating a consistent and auditable history.

## What Gets Enforced

| Rule                                | Effect                                              |
| ----------------------------------- | --------------------------------------------------- |
| **Require PR before merging**       | No direct pushes to main                            |
| **1 approval required**             | Contributors need a review before merging           |
| **Required status checks**          | Format Check, Lint, Build, and Type Check must pass |
| **Strict status checks**            | Branch must be up-to-date with main before merging  |
| **Dismiss stale reviews**           | New pushes to a PR invalidate previous approvals    |
| **Require conversation resolution** | All review comments must be resolved before merging |
| **Block force pushes**              | Prevents rewriting main history                     |
| **Block branch deletion**           | Prevents accidental deletion of main                |

## Merge Settings

| Setting                   | Value                                       |
| ------------------------- | ------------------------------------------- |
| **Squash merge**          | Enabled (only merge strategy allowed)       |
| **Merge commit**          | Disabled                                    |
| **Rebase merge**          | Disabled                                    |
| **Squash commit title**   | Uses PR title (uppercase conventional type) |
| **Squash commit message** | Uses PR body                                |
| **Auto-delete branches**  | Enabled (cleans up after merge)             |

This means every PR becomes a single commit on `main` with the PR title as the commit message. Since PR titles use uppercase conventional types (`FEAT: ...`), release-please is configured to recognize both uppercase and lowercase types.

### Enable via CLI

```bash
gh api repos/<owner>/<repo> --method PATCH --input - <<'EOF'
{
  "allow_squash_merge": true,
  "allow_merge_commit": false,
  "allow_rebase_merge": false,
  "squash_merge_commit_title": "PR_TITLE",
  "squash_merge_commit_message": "PR_BODY",
  "delete_branch_on_merge": true
}
EOF
```

## Owner Bypass

By default, `enforce_admins` is set to `false`. This means the repository owner can:

- Merge their own PRs without waiting for an external review
- Bypass status check requirements in urgent situations

Contributors still need 1 approval and passing CI to merge. This is a practical default for solo maintainers or small teams where the owner is the primary contributor.

> To require the owner to follow the same rules as everyone else, set `enforce_admins` to `true` in the setup command below.

## Quick Setup (All-in-One)

Run a single script to set up branch protection, merge settings, security features, and labels:

```bash
./scripts/setup-github.sh <owner>/<repo>
```

This configures everything documented below. To set up manually, follow the individual steps.

## Manual Setup Steps

### Prerequisites

- GitHub CLI (`gh`) installed and authenticated: `gh auth login`
- Admin or owner access to the repository

### 1. Check Current Protection

```bash
gh api repos/<owner>/<repo>/branches/main/protection
```

If main is unprotected, you'll see: `Branch not protected (HTTP 404)`.

### 2. Enable Branch Protection

```bash
gh api repos/<owner>/<repo>/branches/main/protection \
  --method PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Format Check", "Lint", "Build", "Type Check"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_conversation_resolution": true
}
EOF
```

Replace `<owner>/<repo>` with your GitHub repository path.

### 3. Verify Protection Is Active

```bash
gh api repos/<owner>/<repo>/branches/main/protection
```

You should see all the rules reflected in the JSON response.

### 4. Lock Down for Admins (Optional)

If you want even the owner to require approval:

```bash
gh api repos/<owner>/<repo>/branches/main/protection/enforce_admins \
  --method POST
```

To revert this:

```bash
gh api repos/<owner>/<repo>/branches/main/protection/enforce_admins \
  --method DELETE
```

## Enable Dependency Graph and Security Features

The `dependency-review` CI workflow requires the Dependency Graph to be enabled on the repository. Without it, the workflow will fail with:

```
Error: Dependency review is not supported on this repository.
```

### Enable via CLI

```bash
# Enable Dependabot security updates (also enables Dependency Graph)
gh api repos/<owner>/<repo> --method PATCH --input - <<'EOF'
{
  "security_and_analysis": {
    "dependabot_security_updates": {
      "status": "enabled"
    }
  }
}
EOF

# Enable vulnerability alerts
gh api repos/<owner>/<repo>/vulnerability-alerts --method PUT
```

### Enable via GitHub UI

1. Go to **Settings** → **Code security and analysis**
2. Enable **Dependency graph**
3. Enable **Dependabot alerts**
4. Enable **Dependabot security updates**

### Verify

Re-run the failed CI check. The `Dependency Review` job should now pass.

## GitHub Labels

Labels are used by CI workflows (e.g., `stale.yml` exempts `pinned`, `security`, `work-in-progress`, `dependencies`) and help organize issues and PRs.

### Create All Labels

Replace `<owner>/<repo>` and run:

```bash
REPO="<owner>/<repo>"

# Status
gh label create "work-in-progress" --color "FBCA04" --description "PR not ready for review" --repo "$REPO"
gh label create "ready-for-review" --color "0E8A16" --description "PR is ready to be reviewed" --repo "$REPO"
gh label create "blocked" --color "B60205" --description "Waiting on external dependency or decision" --repo "$REPO"
gh label create "stale" --color "CFD3D7" --description "No recent activity" --repo "$REPO"

# Type
gh label create "feat" --color "1D76DB" --description "New feature" --repo "$REPO"
gh label create "fix" --color "D73A4A" --description "Bug fix" --repo "$REPO"
gh label create "chore" --color "EDEDED" --description "Maintenance, deps, tooling" --repo "$REPO"
gh label create "refactor" --color "D4C5F9" --description "Code restructuring" --repo "$REPO"
gh label create "ci" --color "BFD4F2" --description "CI/CD changes" --repo "$REPO"
gh label create "perf" --color "F9D0C4" --description "Performance improvement" --repo "$REPO"

# Priority
gh label create "priority: critical" --color "B60205" --description "Drop everything" --repo "$REPO"
gh label create "priority: high" --color "D93F0B" --description "Next up" --repo "$REPO"
gh label create "priority: low" --color "0E8A16" --description "Nice to have" --repo "$REPO"

# Scope
gh label create "api" --color "006B75" --description "API/backend changes" --repo "$REPO"
gh label create "web" --color "1D76DB" --description "Web app changes" --repo "$REPO"
gh label create "mobile" --color "5319E7" --description "Mobile app changes" --repo "$REPO"
gh label create "database" --color "0075CA" --description "Schema/migration changes" --repo "$REPO"
gh label create "dependencies" --color "0366D6" --description "Dependency updates" --repo "$REPO"

# Special
gh label create "breaking-change" --color "B60205" --description "Introduces breaking changes" --repo "$REPO"
gh label create "security" --color "EE0701" --description "Security issue" --repo "$REPO"
gh label create "pinned" --color "006B75" --description "Never mark as stale" --repo "$REPO"
```

### Label Reference

| Group    | Labels                                                     | Purpose                                 |
| -------- | ---------------------------------------------------------- | --------------------------------------- |
| Status   | `work-in-progress`, `ready-for-review`, `blocked`, `stale` | PR/issue lifecycle                      |
| Type     | `feat`, `fix`, `chore`, `refactor`, `ci`, `perf`           | Mirrors conventional commit types       |
| Priority | `critical`, `high`, `low`                                  | Triage                                  |
| Scope    | `api`, `web`, `mobile`, `database`, `dependencies`         | Affected area                           |
| Special  | `breaking-change`, `security`, `pinned`                    | CI integration and stale bot exemptions |

## Adjusting Status Checks

The required status checks (`Format Check`, `Lint`, `Build`, `Type Check`) correspond to job names in `.github/workflows/ci.yml`. If you rename or add CI jobs, update the `contexts` array in the protection rule to match.

## Workflow After Enabling

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes and push: `git push -u origin feat/my-feature`
3. Open a PR: `gh pr create`
4. CI runs automatically — wait for checks to pass
5. Get approval (or merge directly if you're the owner with admin bypass)
6. Merge the PR via GitHub
