# GitHub Actions Workflows

This directory contains CI/CD workflows for the monorepo.

## 📋 Available Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual dispatch

**Jobs:**
- **setup** - Installs dependencies and sets up caching
- **lint** - Runs ESLint across all packages
- **typecheck** - Runs TypeScript type checking
- **build** - Builds all apps and packages
- **test** - Runs unit tests for all packages (matrix strategy)
- **test-integration** - Runs integration tests with PostgreSQL
- **ci-success** - Summary job that ensures all checks passed

**Features:**
- ✅ Runs jobs in parallel after setup
- ✅ Caches pnpm store, node_modules, and Turbo
- ✅ Matrix testing for different packages
- ✅ PostgreSQL service for integration tests
- ✅ Uploads build artifacts

**Duration:** ~5-8 minutes

### 2. PR Check Workflow (`pr-check.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened

**Jobs:**
- **validate** - Validates PR title follows conventional commits
- **changes** - Detects which files changed for smart CI
- **quick-check** - Fast lint and typecheck
- **size-check** - Analyzes bundle size impact
- **pr-comment** - Posts results as PR comment

**Features:**
- ✅ Smart CI - only runs checks for changed files
- ✅ Bundle size analysis
- ✅ PR title validation
- ✅ Automatic PR comments with results
- ✅ Cancels previous runs for same PR

**Duration:** ~3-5 minutes

### 3. Test Coverage Workflow (`test-coverage.yml`)

**Triggers:**
- Push to `main`
- Pull requests to `main`
- Manual dispatch

**Jobs:**
- **coverage** - Runs tests with coverage reporting

**Features:**
- ✅ Generates coverage reports
- ✅ Uploads to Codecov (if configured)
- ✅ Adds coverage summary to job summary
- ✅ Archives coverage artifacts
- ✅ PostgreSQL for integration tests

**Duration:** ~6-10 minutes

### 4. Dependency Review Workflow (`dependency-review.yml`)

**Triggers:**
- Pull requests to `main` or `develop`

**Jobs:**
- **dependency-review** - Reviews dependency changes
- **audit** - Runs security audit

**Features:**
- ✅ Scans for vulnerable dependencies
- ✅ Checks for outdated packages
- ✅ Posts summary in PR
- ✅ Fails on moderate+ severity issues

**Duration:** ~2-3 minutes

## 🚀 Optimization Features

### Caching Strategy

All workflows use multi-level caching:

1. **pnpm Store Cache**
   - Key: OS + pnpm-lock.yaml hash
   - Speeds up dependency installation

2. **node_modules Cache**
   - Key: OS + pnpm-lock.yaml hash
   - Shared across all jobs after setup

3. **Turbo Cache**
   - Key: OS + commit SHA
   - Enables Turborepo's incremental builds
   - Restores from previous runs

4. **Build Artifacts Cache**
   - Caches .next, .expo, dist folders
   - Reused across runs

### Parallel Execution

Jobs run in parallel where possible:

```
setup (runs first)
  ↓
lint ─────┐
typecheck ─┤
build ─────┼─→ ci-success
test ──────┤
integration┘
```

### Matrix Testing

Tests run in parallel for multiple packages:
```yaml
matrix:
  package: [api, components, database, errors, utils]
```

## 🔧 Configuration

### Environment Variables

Set these in GitHub repository settings (Settings → Secrets):

- `CODECOV_TOKEN` - For code coverage uploads (optional)
- `GITHUB_TOKEN` - Automatically provided by GitHub

### Required Permissions

The workflows need these permissions:
- `contents: read` - Read repository contents
- `pull-requests: write` - Comment on PRs
- `actions: read` - Access workflow information

### Branch Protection

Recommended branch protection rules for `main`:

- ✅ Require status checks to pass:
  - `CI Success`
  - `Quick Validation`
  - `Quick Check`
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Require conversation resolution

## 📊 Workflow Status Badges

Add these to your README.md:

```markdown
[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![Test Coverage](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test-coverage.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test-coverage.yml)
```

## 🐛 Debugging Workflows

### View Workflow Runs
1. Go to repository → Actions tab
2. Click on a workflow run
3. Expand job steps to see logs

### Enable Debug Logging

Add these secrets to enable verbose logging:
- `ACTIONS_STEP_DEBUG: true`
- `ACTIONS_RUNNER_DEBUG: true`

### Common Issues

**Issue: Cache misses**
- Check if pnpm-lock.yaml changed
- Verify cache key matches across jobs

**Issue: Tests failing in CI but passing locally**
- Check environment variables
- Verify PostgreSQL connection
- Ensure GH_ACTIONS=true is set

**Issue: Slow workflow runs**
- Check cache hit rates
- Consider splitting large jobs
- Use matrix strategy for parallel execution

## 📈 Performance Tips

1. **Use Turbo Remote Caching**
   ```bash
   # Set up Vercel Remote Cache
   pnpm turbo login
   pnpm turbo link
   ```

2. **Optimize Dependencies**
   - Keep pnpm-lock.yaml committed
   - Use `--frozen-lockfile` in CI
   - Audit and remove unused dependencies

3. **Smart CI**
   - Use path filters to skip unnecessary jobs
   - Run quick checks before expensive ones
   - Cancel outdated runs

4. **Artifact Management**
   - Set appropriate retention days
   - Only upload necessary artifacts
   - Use compressed formats

## 🔄 Workflow Updates

To modify workflows:

1. Edit YAML files in `.github/workflows/`
2. Test changes in a feature branch
3. Create PR to review changes
4. Monitor first run carefully
5. Update this README if behavior changes

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm in CI/CD](https://pnpm.io/continuous-integration)
- [Turborepo CI/CD](https://turbo.build/repo/docs/ci)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

---

**Note:** Replace `YOUR_USERNAME/YOUR_REPO` with your actual GitHub repository details.
