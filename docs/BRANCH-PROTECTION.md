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

## Owner Bypass

By default, `enforce_admins` is set to `false`. This means the repository owner can:

- Merge their own PRs without waiting for an external review
- Bypass status check requirements in urgent situations

Contributors still need 1 approval and passing CI to merge. This is a practical default for solo maintainers or small teams where the owner is the primary contributor.

> To require the owner to follow the same rules as everyone else, set `enforce_admins` to `true` in the setup command below.

## Setup Steps

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

## Adjusting Status Checks

The required status checks (`Format Check`, `Lint`, `Build`, `Type Check`) correspond to job names in `.github/workflows/ci.yml`. If you rename or add CI jobs, update the `contexts` array in the protection rule to match.

## Workflow After Enabling

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes and push: `git push -u origin feat/my-feature`
3. Open a PR: `gh pr create`
4. CI runs automatically — wait for checks to pass
5. Get approval (or merge directly if you're the owner with admin bypass)
6. Merge the PR via GitHub
