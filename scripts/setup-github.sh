#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# GitHub Repository Setup Script
#
# Sets up branch protection, merge settings, labels, and security features.
# Requires: GitHub CLI (gh) authenticated with admin access.
#
# Usage:
#   ./scripts/setup-github.sh <owner>/<repo>
#
# Example:
#   ./scripts/setup-github.sh whyuascii/gluestack-universal-react-monorepo
#
# See docs/BRANCH-PROTECTION.md for details.
# =============================================================================

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <owner>/<repo>"
  echo "Example: $0 whyuascii/gluestack-universal-react-monorepo"
  exit 1
fi

REPO="$1"

# Check gh is authenticated
if ! gh auth status &>/dev/null; then
  echo "Error: GitHub CLI is not authenticated. Run 'gh auth login' first."
  exit 1
fi

# Verify repo access
if ! gh api "repos/$REPO" --jq '.full_name' &>/dev/null; then
  echo "Error: Cannot access $REPO. Check the repo name and your permissions."
  exit 1
fi

echo "Setting up GitHub repo: $REPO"
echo "============================================"

# ---------------------------------------------------------------------------
# 1. Branch Protection
# ---------------------------------------------------------------------------
echo ""
echo "[1/5] Configuring branch protection on main..."

gh api "repos/$REPO/branches/main/protection" \
  --method PUT \
  --silent \
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

echo "  - Require PR before merging (1 approval)"
echo "  - Required status checks: Format Check, Lint, Build, Type Check"
echo "  - Dismiss stale reviews on new pushes"
echo "  - Require conversation resolution"
echo "  - Admin bypass enabled (owner can merge without approval)"
echo "  - Force pushes and branch deletion blocked"

# ---------------------------------------------------------------------------
# 2. Merge Settings
# ---------------------------------------------------------------------------
echo ""
echo "[2/5] Configuring merge settings..."

gh api "repos/$REPO" --method PATCH --silent --input - <<'EOF'
{
  "allow_squash_merge": true,
  "allow_merge_commit": false,
  "allow_rebase_merge": false,
  "squash_merge_commit_title": "PR_TITLE",
  "squash_merge_commit_message": "PR_BODY",
  "delete_branch_on_merge": true
}
EOF

echo "  - Squash merge only (merge commit and rebase disabled)"
echo "  - Squash commit title uses PR title (uppercase conventional type)"
echo "  - Squash commit message uses PR body"
echo "  - Auto-delete branches after merge"

# ---------------------------------------------------------------------------
# 3. Security Features
# ---------------------------------------------------------------------------
echo ""
echo "[3/5] Enabling security features..."

gh api "repos/$REPO" --method PATCH --silent --input - <<'EOF'
{
  "security_and_analysis": {
    "dependabot_security_updates": {
      "status": "enabled"
    }
  }
}
EOF

gh api "repos/$REPO/vulnerability-alerts" --method PUT --silent 2>/dev/null || true

echo "  - Dependency graph enabled"
echo "  - Dependabot security updates enabled"
echo "  - Vulnerability alerts enabled"

# ---------------------------------------------------------------------------
# 3. Labels
# ---------------------------------------------------------------------------
echo ""
echo "[4/5] Configuring GitHub Actions permissions..."

gh api "repos/$REPO/actions/permissions/workflow" --method PUT --silent --input - <<'EOF'
{
  "default_workflow_permissions": "write",
  "can_approve_pull_request_reviews": true
}
EOF

echo "  - Default workflow permissions: write"
echo "  - GitHub Actions can create and approve pull requests"
echo "  - Required for release-please to open Release PRs"

# ---------------------------------------------------------------------------
# 5. Labels
# ---------------------------------------------------------------------------
echo ""
echo "[5/5] Creating labels..."

create_label() {
  local name="$1" color="$2" description="$3"
  if gh label create "$name" --color "$color" --description "$description" --repo "$REPO" 2>/dev/null; then
    echo "  + $name"
  else
    echo "  ~ $name (already exists)"
  fi
}

echo "  Status:"
create_label "work-in-progress" "FBCA04" "PR not ready for review"
create_label "ready-for-review" "0E8A16" "PR is ready to be reviewed"
create_label "blocked" "B60205" "Waiting on external dependency or decision"
create_label "stale" "CFD3D7" "No recent activity"

echo "  Type:"
create_label "feat" "1D76DB" "New feature"
create_label "fix" "D73A4A" "Bug fix"
create_label "chore" "EDEDED" "Maintenance, deps, tooling"
create_label "refactor" "D4C5F9" "Code restructuring"
create_label "ci" "BFD4F2" "CI/CD changes"
create_label "perf" "F9D0C4" "Performance improvement"

echo "  Priority:"
create_label "priority: critical" "B60205" "Drop everything"
create_label "priority: high" "D93F0B" "Next up"
create_label "priority: low" "0E8A16" "Nice to have"

echo "  Scope:"
create_label "api" "006B75" "API/backend changes"
create_label "web" "1D76DB" "Web app changes"
create_label "mobile" "5319E7" "Mobile app changes"
create_label "database" "0075CA" "Schema/migration changes"
create_label "dependencies" "0366D6" "Dependency updates"

echo "  Special:"
create_label "breaking-change" "B60205" "Introduces breaking changes"
create_label "security" "EE0701" "Security issue"
create_label "pinned" "006B75" "Never mark as stale"

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
echo "============================================"
echo "Setup complete for $REPO"
echo ""
echo "Next steps:"
echo "  1. Verify at https://github.com/$REPO/settings/branches"
echo "  2. Verify at https://github.com/$REPO/settings/security_analysis"
echo "  3. See docs/BRANCH-PROTECTION.md for details"
