# Working with Claude Code

A practical guide to using Claude Code for building features, managing workflows, and shipping entire products in this cross-platform monorepo.

## Table of Contents

- [Quick Start](#quick-start)
- [How Claude Understands This Codebase](#how-claude-understands-this-codebase)
- [Skills System](#skills-system)
- [Common Workflows](#common-workflows)
- [Multi-Agent Development](#multi-agent-development)
- [Custom Commands](#custom-commands)
- [Context Management](#context-management)
- [Advanced: Product Development with Worktrees](#advanced-product-development-with-worktrees)
- [Tips and Best Practices](#tips-and-best-practices)

---

## Quick Start

Open your terminal in the repo root and launch Claude Code:

```bash
claude
```

Claude automatically reads `CLAUDE.md` and understands the monorepo architecture, layer rules, and where code belongs. You can immediately start working:

```
> Build me a task management feature with CRUD endpoints and a list screen
> Create a new screen for user settings
> Add a Spanish translation for the dashboard
> Review the auth module for security issues
```

---

## How Claude Understands This Codebase

Claude uses a layered knowledge system that mirrors the monorepo structure:

### CLAUDE.md Hierarchy

```
CLAUDE.md                              # Always loaded — architecture, rules, commands
├── packages/ui/CLAUDE.md              # Loaded when working in packages/ui/
├── packages/database/CLAUDE.md        # Loaded when working in packages/database/
├── packages/core-contract/CLAUDE.md   # Loaded when working in packages/core-contract/
├── packages/auth/CLAUDE.md            # Loaded when working in packages/auth/
├── packages/components/CLAUDE.md      # ...and so on for every package
├── apps/web/CLAUDE.md
├── apps/mobile/CLAUDE.md
├── apps/api/CLAUDE.md
└── apps/admin/CLAUDE.md
```

**Root `CLAUDE.md`** loads on every conversation and contains the essentials: tech stack, architecture diagram, layer rules, feature development order, and skill references.

**Package-level `CLAUDE.md` files** load automatically when Claude works in that directory. They contain detailed patterns, code examples, and conventions specific to that package. This keeps the root file concise while giving Claude deep context when it needs it.

### Rules (`.claude/rules/`)

Five rule files enforce architectural constraints across all skills:

| Rule          | Applies To                                 | Enforces                                                 |
| ------------- | ------------------------------------------ | -------------------------------------------------------- |
| `api.md`      | `apps/api/**`, `packages/core-contract/**` | Contract-first, middleware order, error handling         |
| `database.md` | `packages/database/**`                     | Schema conventions, migration workflow, typed queries    |
| `ui.md`       | `packages/ui/**`, `packages/components/**` | Screens in packages/ui only, i18n, design tokens         |
| `mobile.md`   | `apps/mobile/**`                           | Native signOut, SafeAreaView, platform-specific patterns |
| `i18n.md`     | `packages/i18n/**`                         | English first, all languages, namespace registration     |

Rules activate automatically based on file paths — you don't need to invoke them.

### .claudeignore

Excludes `node_modules`, build output, native builds, generated migrations, `.env` files, and other noise from Claude's context window, keeping it focused on your source code.

---

## Skills System

Skills are specialized agents with domain knowledge, tool restrictions, and focused prompts. They live in `.claude/skills/` and activate when you describe a task that matches their trigger.

### Available Skills

| Skill               | What It Does                                    | How to Trigger                          |
| ------------------- | ----------------------------------------------- | --------------------------------------- |
| `build-feature`     | Orchestrates all agents for end-to-end delivery | "Build me a [feature]"                  |
| `screen-builder`    | Creates screens across packages/ui + app routes | "Create a new [name] screen"            |
| `building-features` | Reference guide for feature implementation      | "Add a [feature] with endpoints and UI" |
| `frontend-designer` | Designs component specs before implementation   | "Design the UI for [feature]"           |
| `backend-developer` | Implements contracts, routes, actions, schema   | "Create an API for [feature]"           |
| `web-developer`     | Implements Next.js pages and web-specific code  | "Build the web frontend for [feature]"  |
| `mobile-developer`  | Implements Expo screens and native integrations | "Build the mobile screen for [feature]" |
| `test-engineer`     | Writes API, component, and E2E tests            | "Write tests for [feature]"             |
| `code-reviewer`     | Reviews patterns, performance, accessibility    | "Review this code"                      |
| `security-reviewer` | Audits auth, injection, data exposure (OWASP)   | "Security review the auth flow"         |
| `i18n-manager`      | Manages translations and language support       | "Add translations for [feature]"        |
| `feature-flags`     | Sets up PostHog flags, A/B tests, surveys       | "Add a feature flag for [feature]"      |

### Skill Selection Flowchart

```
I need to...
├── Build a complete feature              → build-feature (orchestrator)
├── Create a screen with routes           → screen-builder
├── Design before implementing            → frontend-designer
├── Add API endpoints                     → backend-developer
├── Add web pages                         → web-developer
├── Add mobile screens                    → mobile-developer
├── Write tests                           → test-engineer
├── Review code quality                   → code-reviewer
├── Audit security                        → security-reviewer
├── Add/manage translations               → i18n-manager
├── Add feature flags or A/B tests        → feature-flags
└── General guidance on where code goes   → building-features
```

### Skill Properties

Skills use YAML frontmatter to configure behavior:

```yaml
---
name: code-reviewer
description: Use when reviewing code quality before deployment
context: fork # Runs in isolated subagent (can't modify files)
allowed-tools: Read, Glob, Grep, Bash # Read-only access
---
```

| Property                         | Effect                                                      |
| -------------------------------- | ----------------------------------------------------------- |
| `context: fork`                  | Isolated context — reviewers can't accidentally modify code |
| `allowed-tools`                  | Restricts which tools the skill can use                     |
| `disable-model-invocation: true` | Must be explicitly called (orchestrator only)               |

---

## Common Workflows

### 1. Build a Complete Feature

The fastest path from idea to working code. The orchestrator coordinates specialized agents automatically.

```
> Build me a task management system with projects, tasks, assignees, and due dates
```

**What happens behind the scenes:**

```
1. Analyze & Plan      → Understand scope, data models, APIs
2. Design              → Component hierarchy, responsive specs (frontend-designer)
3. Backend             → Contracts, actions, routes, schema (backend-developer)
4. Frontend (parallel) → Shared screens + hooks (web-developer + mobile-developer)
5. Testing             → API tests, component tests (test-engineer)
6. Code Review         → Patterns, performance, accessibility (code-reviewer)
7. Security Review     → Auth, injection, data exposure (security-reviewer)
```

The orchestrator skips phases that don't apply. API-only requests skip design and frontend. Web-only requests skip mobile.

### 2. Create a New Screen

For adding a single screen with proper cross-platform support:

```
> Create a settings screen where users can update their profile name and avatar
```

Or use the command directly:

```
> /new-screen
```

**The screen-builder produces:**

| Artifact                | Location                           |
| ----------------------- | ---------------------------------- |
| Query/mutation hooks    | `packages/ui/src/hooks/`           |
| Shared screen component | `packages/ui/src/screens/private/` |
| English translations    | `packages/i18n/src/locales/en/`    |
| Spanish translations    | `packages/i18n/src/locales/es/`    |
| Web route wrapper       | `apps/web/src/app/(private)/`      |
| Mobile route wrapper    | `apps/mobile/src/app/(private)/`   |
| Barrel file exports     | All necessary `index.ts` files     |

### 3. Add an API Endpoint

```
> Create a REST endpoint for managing team invitations with create, list, accept, and decline
```

Or: `/new-endpoint`

**Claude follows the contract-first approach:**

1. Define oRPC contract in `packages/core-contract/`
2. Create action class in `apps/api/src/actions/`
3. Wire route handler in `apps/api/src/orpc-routes/`
4. Create query/mutation hooks in `packages/ui/src/hooks/`
5. Run `pnpm typecheck`

### 4. Add a Database Table

```
> Add a comments table with user references, polymorphic parent (task or project), and soft delete
```

Or: `/db-migration`

**Claude follows the migration workflow:**

1. Define schema in `packages/database/src/schema/tables/`
2. Export through barrel files
3. `pnpm --filter database generate` → review SQL
4. `pnpm --filter database db:migrate`

### 5. Add Translations

```
> Add Spanish translations for the new notifications screen
```

Or: `/add-translation`

### 6. Run Quality Checks

```
> Run a full quality check
```

Or: `/quality-check` — runs typecheck, lint, and test in sequence.

### 7. Code Review Before Merging

```
> Review all the changes I made to the auth module
```

The `code-reviewer` runs in a forked context (read-only) and produces a structured report with severity levels: Critical, Important, Minor, Suggestions.

### 8. Security Audit

```
> Do a security review of the subscription billing flow
```

The `security-reviewer` checks OWASP Top 10 concerns specific to this codebase: tenant isolation, RBAC bypass, middleware stack ordering, PII exposure.

---

## Multi-Agent Development

For complex features, Claude dispatches multiple specialized agents that work in parallel where possible.

### How It Works

```
You: "Build me a project management feature"
                    │
          ┌─────────┴─────────┐
          │   Orchestrator    │  ← Analyzes scope, creates plan
          └─────────┬─────────┘
                    │
          ┌─────────┴─────────┐
          │ frontend-designer │  ← Component specs, layout, tokens
          └─────────┬─────────┘
                    │
          ┌─────────┴─────────┐
          │ backend-developer │  ← Contracts, schema, routes, actions
          └─────────┬─────────┘
                    │
          ┌─────────┴─────────┐
    ┌─────┴─────┐  ┌──────┴──────┐
    │ web-dev   │  │ mobile-dev  │  ← Run in parallel after backend
    └─────┬─────┘  └──────┬──────┘
          └────────┬──────┘
                   │
          ┌────────┴────────┐
          │  test-engineer  │  ← API tests, component tests
          └────────┬────────┘
                   │
          ┌────────┴────────┐    ┌──────────────────┐
          │ code-reviewer   │    │ security-reviewer │  ← Run in parallel
          └────────┬────────┘    └──────────┬───────┘
                   └──────────┬─────────────┘
                              │
                        ✅ Complete
```

### Agent Dispatch Patterns

**Sequential (default):** Each phase completes before the next. Backend must finish before frontend starts because frontend depends on contracts and hooks.

**Parallel when safe:** Web and mobile developers run simultaneously after backend delivers contracts. Code reviewer and security reviewer run simultaneously.

**Review loops:** If reviewers find critical issues, the orchestrator dispatches fix agents and re-runs the review.

### Invoking Multi-Agent Workflows

**Automatic orchestration:**

```
> Build me a notifications preferences screen with per-channel toggles
```

**Manual agent dispatch** (when you want more control):

```
> Use the backend-developer skill to create the notifications preferences API
> Use the web-developer skill to build the web frontend for notification preferences
> Use the test-engineer skill to write tests for the notification preferences feature
```

---

## Custom Commands

Commands are shortcuts for common workflows. Use them with the `/` prefix:

| Command            | What It Does                                           |
| ------------------ | ------------------------------------------------------ |
| `/new-screen`      | Walks through creating a cross-platform screen         |
| `/new-endpoint`    | Creates an API endpoint following monorepo conventions |
| `/db-migration`    | Creates database schema changes and runs migrations    |
| `/add-translation` | Adds translation keys for a feature                    |
| `/quality-check`   | Runs typecheck + lint + test suite                     |

Commands live in `.claude/commands/` as markdown templates. You can add your own by creating a new `.md` file in that directory.

### Creating a Custom Command

Create a file at `.claude/commands/my-command.md`:

```markdown
Run the following steps:

1. [Step description]
2. [Step description]
3. Verify: `pnpm typecheck`
```

Then use it: `/my-command`

---

## Context Management

Claude Code has a context window limit. Large monorepos need careful context management.

### Strategies

**1. Compact regularly**
Run `/compact` when you notice context usage approaching ~50%. This summarizes the conversation and frees context for more work.

**2. Break work into subtasks**
Instead of "build the entire user management system," work in chunks:

```
Session 1: "Create the database schema and API contracts for user management"
Session 2: "Build the API routes and actions for user management"
Session 3: "Create the shared screens and hooks for user management"
```

Each session stays well within context limits and produces committed code.

**3. Use plan mode for complex tasks**
Start with plan mode to understand scope before writing code:

```
> Plan the implementation of a team billing dashboard
```

Claude explores the codebase, designs the approach, and presents a plan for your approval before writing any code.

**4. Commit frequently**
After completing each logical unit:

```
> Commit this with a descriptive message
```

This creates checkpoints you can return to and keeps your working directory clean.

### Progressive Disclosure

The CLAUDE.md hierarchy means Claude only loads detailed context when needed:

- Working on a screen? `packages/ui/CLAUDE.md` loads with screen patterns, hook conventions, and store architecture.
- Working on the API? `apps/api/CLAUDE.md` and `packages/core-contract/CLAUDE.md` load with contract definitions, middleware stack, and error handling.
- Working on mobile? `apps/mobile/CLAUDE.md` loads with Expo Router patterns, native auth, and SafeAreaView conventions.

You don't need to explain the codebase — Claude picks up the right context automatically.

---

## Advanced: Product Development with Worktrees

For building an entire product from a PRD (Product Requirements Document), use git worktrees to develop features in isolation and merge them together.

### What Are Git Worktrees?

A worktree is a separate working directory linked to the same git repository. Each worktree can be on a different branch, allowing you to work on multiple features simultaneously without stashing or switching branches.

```
my-app/                          ← main branch (your primary directory)
my-app-feature-auth/             ← feature/auth branch (isolated worktree)
my-app-feature-billing/          ← feature/billing branch (isolated worktree)
my-app-feature-notifications/    ← feature/notifications branch (isolated worktree)
```

Each worktree has its own `node_modules`, build cache, and running dev server. Changes in one don't affect others.

### The Workflow: PRD to Product

#### Phase 1: Break Down the PRD

Start by having Claude analyze your PRD and produce a feature breakdown:

```
> Here is my PRD for [product name]. Break it down into independent feature
> branches that can be developed in parallel and merged together.
> Consider database dependencies — features that share tables should be
> sequenced, not parallelized.
```

Claude will produce something like:

```
Feature Branches (in dependency order):

1. feature/core-schema     ← Shared database tables (must go first)
2. feature/auth-system     ← Auth flows, depends on core-schema
3. feature/team-management ← Teams, invites, RBAC (depends on auth)
4. feature/billing         ← Subscriptions, payments (depends on auth)
5. feature/dashboard       ← Main dashboard (depends on teams + billing)
6. feature/notifications   ← Notification system (can parallel with dashboard)
7. feature/admin-panel     ← Admin tools (depends on everything above)
```

#### Phase 2: Create Worktrees

Set up isolated environments for each feature:

```bash
# Create worktrees from main branch
git worktree add ../my-app-core-schema feature/core-schema
git worktree add ../my-app-auth feature/auth-system
git worktree add ../my-app-teams feature/team-management
git worktree add ../my-app-billing feature/billing
git worktree add ../my-app-dashboard feature/dashboard

# Install dependencies in each (or use pnpm's shared store)
cd ../my-app-core-schema && pnpm install
cd ../my-app-auth && pnpm install
# ... etc
```

Or ask Claude to set them up:

```
> Create git worktrees for each feature branch in the PRD breakdown
```

#### Phase 3: Develop Features in Parallel

Open separate Claude Code sessions in each worktree. Each session has full context of its feature branch without interference from other in-progress work.

**Session 1 — Core Schema** (must complete first):

```bash
cd ../my-app-core-schema
claude
> Build the database schema for [product]. Create all shared tables,
> relations, and generate migrations. Follow the PRD section on data models.
```

**Session 2 — Auth System** (after core-schema merges):

```bash
cd ../my-app-auth
claude
> Implement the authentication system from the PRD. Include signup, login,
> password reset, email verification, and OAuth with Google.
```

**Sessions 3 & 4 — Teams and Billing** (can run in parallel after auth merges):

```bash
# Terminal 1
cd ../my-app-teams && claude
> Build the team management feature from the PRD. Include team creation,
> invitations, role management, and member removal.

# Terminal 2
cd ../my-app-billing && claude
> Build the billing system from the PRD. Include subscription tiers,
> Polar integration for web, RevenueCat for mobile, and entitlement checks.
```

#### Phase 4: Merge Features Together

As features complete, merge them back:

```bash
# Back in main working directory
cd my-app

# Merge completed features in dependency order
git merge feature/core-schema
git merge feature/auth-system
git merge feature/team-management
git merge feature/billing
git merge feature/dashboard
git merge feature/notifications
```

Resolve any conflicts at each merge point. Claude can help:

```
> There are merge conflicts between feature/billing and feature/teams
> in packages/database/src/schema/. Help me resolve them.
```

#### Phase 5: Integration Testing

After all features are merged, run a full integration pass:

```
> Run a complete quality check and fix any issues from the merge
> /quality-check
```

Then do a comprehensive review:

```
> Review the entire codebase for consistency across all the merged features.
> Check for duplicate code, conflicting patterns, and missing integrations.
```

#### Phase 6: Clean Up Worktrees

```bash
git worktree remove ../my-app-core-schema
git worktree remove ../my-app-auth
git worktree remove ../my-app-teams
git worktree remove ../my-app-billing
git worktree remove ../my-app-dashboard
```

### Worktree Best Practices

**Dependency ordering matters.** Database schema changes should merge first. Features that depend on those schemas should branch from the merged result, not from the original main.

**Keep worktrees focused.** Each worktree should address one feature area. Resist the urge to fix unrelated things — note them for later.

**Rebase before merging.** After the dependency feature merges to main, rebase your dependent branch:

```bash
cd ../my-app-billing
git rebase main
```

**Use the orchestrator in each worktree.** Within a single worktree, Claude's `build-feature` orchestrator handles the full pipeline (design → backend → frontend → tests → review) for that feature.

**Commit frequently in each worktree.** Small, focused commits make conflict resolution easier during the merge phase.

### Example: Full Product Build Timeline

```
Day 1
├── Session 1: Plan — Break PRD into feature branches
├── Session 2: Core Schema — Database tables, migrations
└── Merge core-schema → main

Day 2
├── Session 3: Auth (worktree) — Signup, login, OAuth, verification
├── Session 4: Billing (worktree, parallel) — Subscriptions, entitlements
└── Merge auth → main, rebase billing on main

Day 3
├── Session 5: Teams (worktree) — Invites, RBAC, member management
├── Session 6: Billing (continue) — Complete and merge
└── Merge teams → main, merge billing → main

Day 4
├── Session 7: Dashboard (worktree) — Main app screens
├── Session 8: Notifications (worktree, parallel) — In-app, push, email
└── Merge both → main

Day 5
├── Session 9: Admin Panel (worktree) — Support tools, impersonation
├── Session 10: Integration — Quality check, cross-feature review, polish
└── Final merge, tag release
```

---

## Tips and Best Practices

### Effective Prompting

**Be specific about scope:**

```
# Good — clear scope
> Create the API endpoint for listing team members with pagination, filtering
> by role, and search by name. Include the oRPC contract and action class.

# Vague — Claude has to guess
> Add team members API
```

**Reference the architecture:**

```
# Good — uses the codebase vocabulary
> Add a mutation hook in packages/ui/src/hooks/mutations/ for updating
> notification preferences, following the pattern in useTodos.ts

# Generic — doesn't leverage the skill system
> Make a function to update notification settings
```

**Chain with reviews:**

```
> Build the file upload feature with S3 integration
> ... [Claude builds it] ...
> Now review what you just built for security issues
> ... [Claude runs security-reviewer] ...
> Fix the issues found in the review
```

### Session Patterns

**The focused session** (most common):

```
1. Describe the task clearly
2. Let Claude plan and implement
3. Review the output
4. Commit
```

**The iterative session:**

```
1. "Create the database schema for comments"
2. "Now create the API contracts and routes"
3. "Add the shared screen with hooks"
4. "Add translations"
5. "Run quality check"
6. "Commit all changes"
```

**The review session:**

```
1. "Review all changes on this branch for code quality"
2. "Now do a security review"
3. "Fix the critical issues found"
4. "Create a PR with a summary of all changes"
```

### When to Use Plan Mode

Plan mode is valuable when:

- The feature touches 3+ packages
- You're unsure about the approach
- There are multiple valid architectures
- The task will use significant context

```
> Plan the implementation of real-time collaboration for the task board
```

Claude will explore the codebase, identify relevant files, and present an implementation plan before writing any code. You approve or adjust before it starts.

### Automation with Hooks

The repo includes a post-edit hook that automatically formats files with Prettier after Claude writes or edits them. This means you never need to run formatting manually during a Claude session.

Additional hooks configured:

- **macOS notifications** when Claude needs your attention
- **Glass sound** when a task completes (useful for background work)

You can add custom hooks in `.claude/settings.json` for your workflow.
