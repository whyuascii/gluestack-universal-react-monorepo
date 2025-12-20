# Configuration Guide

This guide explains all configuration options for the infrastructure deployment.

## Configuration Overview

All configuration is managed through Pulumi config. Configuration values are stored per stack, allowing different settings for dev, staging, and production environments.

## Required Configuration

These settings **must** be configured before deploying:

### 1. Supabase Configuration

First, create a Supabase project at https://supabase.com/dashboard, then configure:

```bash
# Supabase Project URL (from project settings)
pulumi config set supabaseUrl https://xxxxx.supabase.co

# Database connection string (from project settings → Database → Connection String)
pulumi config set --secret databaseUrl "postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Supabase anon key (from project settings → API → anon public)
pulumi config set --secret supabaseAnonKey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Supabase service role key (from project settings → API → service_role secret)
pulumi config set --secret supabaseServiceRoleKey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Purpose**: Managed PostgreSQL database with built-in Auth, Storage, and Real-time
**Security**: All secrets stored encrypted in Pulumi state
**Finding your keys**:

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
2. Copy the Project URL, anon key, and service_role key
3. For database URL, go to Settings → Database → Connection String (use "Connection Pooling" mode)

**Note**: Use the connection pooling URL (port 6543) for better performance with serverless deployments.

### 2. Better Auth Secret

```bash
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"
```

**Purpose**: Session signing and encryption for Better Auth
**Security**: Stored encrypted in Pulumi state
**Recommendation**: Use auto-generated strong secret (32+ characters)

### 3. AWS Region

```bash
pulumi config set aws:region us-east-1
```

**Purpose**: AWS region for all resources (App Runner, Amplify, Secrets Manager)
**Options**: Any AWS region (e.g., us-east-1, us-west-2, eu-west-1)
**Recommendation**: Choose region closest to your users
**Note**: Supabase region is configured separately in Supabase dashboard

### 4. GitHub Repository Settings

```bash
pulumi config set githubOwner YOUR_GITHUB_USERNAME
pulumi config set githubRepo your-repo-name
pulumi config set githubBranch main
```

**Purpose**: Amplify connects to GitHub for automatic deployments
**Note**: Repository must exist and be accessible

## Optional Configuration

### Project Name

```bash
pulumi config set projectName myapp
```

**Default**: `app`
**Purpose**: Prefix for all AWS resource names
**Format**: Lowercase alphanumeric, hyphens allowed
**Example**: If `projectName=myapp` and stack is `dev`, RDS instance will be `myapp-db-dev`

### GitHub Token

```bash
pulumi config set --secret githubToken ghp_xxxxxxxxxxxx
```

**When needed**: Only for **private** GitHub repositories
**How to get**: [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
**Required scopes**: `repo` (full control of private repositories)

### Custom Domain

```bash
pulumi config set domain yourdomain.com
```

**Purpose**: Custom domain for web and API
**Prerequisites**: Domain must be registered and hosted in Route 53
**Results in**:

- Web: `https://yourdomain.com` and `https://www.yourdomain.com`
- API: `https://api.yourdomain.com`

**Without custom domain**: Uses auto-generated Amplify and App Runner URLs

### OAuth Providers

#### Google OAuth

```bash
pulumi config set --secret googleClientId your-google-client-id
pulumi config set --secret googleClientSecret your-google-client-secret
```

**How to get**: [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)

#### GitHub OAuth

```bash
pulumi config set --secret githubClientId your-github-client-id
pulumi config set --secret githubClientSecret your-github-client-secret
```

**How to get**: [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)

### Analytics (PostHog)

```bash
pulumi config set --secret posthogKey phc_xxxxxxxxxxxx
pulumi config set posthogHost https://us.i.posthog.com
```

**When needed**: If using PostHog for analytics
**How to get**: [PostHog Project Settings](https://us.i.posthog.com/project/settings)

## Configuration Examples

### Minimal Development Setup

```bash
# Stack
pulumi stack init dev

# Required - AWS
pulumi config set aws:region us-east-1

# Required - Supabase (create project first at https://supabase.com)
pulumi config set supabaseUrl https://xxxxx.supabase.co
pulumi config set --secret databaseUrl "postgresql://postgres.[ref]:[PASSWORD]@db.xxxxx.supabase.com:5432/postgres"
pulumi config set --secret supabaseAnonKey "eyJxxx..."
pulumi config set --secret supabaseServiceRoleKey "eyJxxx..."

# Required - Auth
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"

# Required - GitHub
pulumi config set githubOwner myusername
pulumi config set githubRepo my-monorepo
pulumi config set githubBranch main

# Deploy
pulumi up
```

### Production Setup with Custom Domain

```bash
# Stack
pulumi stack init prod

# Required - AWS
pulumi config set aws:region us-east-1
pulumi config set projectName mycompany

# Required - Supabase
pulumi config set supabaseUrl https://xxxxx.supabase.co
pulumi config set --secret databaseUrl "postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
pulumi config set --secret supabaseAnonKey "eyJxxx..."
pulumi config set --secret supabaseServiceRoleKey "eyJxxx..."

# Required - Auth
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"

# Required - GitHub
pulumi config set githubOwner mycompany
pulumi config set githubRepo production-app
pulumi config set githubBranch main

# Optional - Custom domain
pulumi config set domain mycompany.com

# Optional - OAuth
pulumi config set --secret googleClientId xxx.apps.googleusercontent.com
pulumi config set --secret googleClientSecret GOCSPX-xxxxxxxxxxxx
pulumi config set --secret githubClientId Iv1.xxxxxxxxxxxx
pulumi config set --secret githubClientSecret xxxxxxxxxxxx

# Optional - Analytics
pulumi config set --secret posthogKey phc_xxxxxxxxxxxx
pulumi config set posthogHost https://us.i.posthog.com

# Deploy
pulumi up
```

### Multi-Environment Setup

```bash
# Development (use dev Supabase project)
pulumi stack init dev
pulumi config set aws:region us-east-1
pulumi config set projectName myapp
pulumi config set supabaseUrl https://dev-xxxxx.supabase.co
pulumi config set --secret databaseUrl "postgresql://..."
pulumi config set --secret supabaseAnonKey "eyJxxx..."
pulumi config set --secret supabaseServiceRoleKey "eyJxxx..."
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"
# ... other dev settings
pulumi up

# Staging (use staging Supabase project)
pulumi stack init staging
pulumi config set aws:region us-east-1
pulumi config set projectName myapp
pulumi config set supabaseUrl https://staging-xxxxx.supabase.co
pulumi config set --secret databaseUrl "postgresql://..."
pulumi config set --secret supabaseAnonKey "eyJxxx..."
pulumi config set --secret supabaseServiceRoleKey "eyJxxx..."
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"
# ... other staging settings
pulumi up

# Production (use production Supabase project)
pulumi stack init prod
pulumi config set aws:region us-east-1
pulumi config set projectName myapp
pulumi config set domain myapp.com
pulumi config set supabaseUrl https://prod-xxxxx.supabase.co
pulumi config set --secret databaseUrl "postgresql://..."
pulumi config set --secret supabaseAnonKey "eyJxxx..."
pulumi config set --secret supabaseServiceRoleKey "eyJxxx..."
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"
# ... other prod settings
pulumi up
```

**Note**: Create separate Supabase projects for each environment (dev, staging, prod) for proper isolation.

## Viewing Configuration

### View all configuration

```bash
pulumi config
```

### View specific value

```bash
pulumi config get projectName
```

### View encrypted secret (plaintext)

```bash
pulumi config get --show-secrets dbPassword
```

### Export configuration (for backup)

```bash
pulumi stack export > backup.json
```

## Configuration Storage

Pulumi stores configuration in two places:

1. **`Pulumi.<stack-name>.yaml`**: Stack-specific configuration (encrypted secrets)
2. **Pulumi state**: Complete infrastructure state (stored in Pulumi backend)

Example `Pulumi.dev.yaml`:

```yaml
config:
  aws:region: us-east-1
  infrastructure:betterAuthSecret:
    secure: AAABAxxxxxxxxxxxx
  infrastructure:dbPassword:
    secure: AAABAxxxxxxxxxxxx
  infrastructure:githubBranch: main
  infrastructure:githubOwner: myusername
  infrastructure:githubRepo: my-repo
  infrastructure:projectName: myapp
```

## Security Best Practices

### ✅ Do

- Use `--secret` flag for sensitive values (passwords, tokens, keys)
- Generate strong random passwords with `openssl rand -base64 32`
- Use different secrets for each environment (dev, staging, prod)
- Back up your Pulumi state regularly
- Use Pulumi Cloud or S3 backend (not local) for team collaboration
- Review `pulumi config` output before sharing (secrets are hidden)

### ❌ Don't

- Store secrets in plain text
- Commit `Pulumi.<stack>.yaml` with secrets to git (they're encrypted, but still)
- Reuse production secrets in development
- Share `--show-secrets` output publicly
- Use weak or guessable passwords

## Troubleshooting

### "missing required configuration"

```bash
# Check what's configured
pulumi config

# Set missing value
pulumi config set <key> <value>
```

### "secret decryption failed"

Your Pulumi passphrase may have changed. Check:

```bash
pulumi stack export
```

### "cannot find stack"

```bash
# List all stacks
pulumi stack ls

# Select correct stack
pulumi stack select dev
```

### Change configuration value

```bash
# Update value
pulumi config set projectName newname

# Update secret
pulumi config set --secret dbPassword "new-password"

# Apply changes
pulumi up
```

### Remove configuration value

```bash
pulumi config rm githubToken
```

## Quick Reference

| Configuration            | Required | Secret | Default                    | Purpose                    |
| ------------------------ | -------- | ------ | -------------------------- | -------------------------- |
| `aws:region`             | ✅       | ❌     | -                          | AWS region                 |
| `supabaseUrl`            | ✅       | ❌     | -                          | Supabase project URL       |
| `databaseUrl`            | ✅       | ✅     | -                          | Supabase connection string |
| `supabaseAnonKey`        | ✅       | ✅     | -                          | Supabase anon public key   |
| `supabaseServiceRoleKey` | ✅       | ✅     | -                          | Supabase service role key  |
| `betterAuthSecret`       | ✅       | ✅     | -                          | Auth signing secret        |
| `githubOwner`            | ✅       | ❌     | -                          | GitHub username/org        |
| `githubRepo`             | ✅       | ❌     | -                          | Repository name            |
| `githubBranch`           | ✅       | ❌     | `main`                     | Git branch                 |
| `projectName`            | ❌       | ❌     | `app`                      | Resource name prefix       |
| `githubToken`            | ❌       | ✅     | -                          | For private repos          |
| `domain`                 | ❌       | ❌     | -                          | Custom domain              |
| `googleClientId`         | ❌       | ✅     | -                          | Google OAuth               |
| `googleClientSecret`     | ❌       | ✅     | -                          | Google OAuth               |
| `githubClientId`         | ❌       | ✅     | -                          | GitHub OAuth               |
| `githubClientSecret`     | ❌       | ✅     | -                          | GitHub OAuth               |
| `posthogKey`             | ❌       | ✅     | -                          | PostHog analytics          |
| `posthogHost`            | ❌       | ❌     | `https://us.i.posthog.com` | PostHog host               |

## Amplify Platform Configuration

AWS Amplify requires specific platform settings to support Next.js 15 with Server-Side Rendering (App Router).

### Platform Settings

These settings are **automatically configured** in the Pulumi infrastructure code:

| Setting            | Value           | Purpose                                  |
| ------------------ | --------------- | ---------------------------------------- |
| `platform`         | `WEB_COMPUTE`   | Enables SSR capabilities for Next.js     |
| `branch.framework` | `Next.js - SSR` | Configures build process for Next.js SSR |

### Why These Settings Matter

**WEB_COMPUTE Platform**:

- Required for Next.js App Router with Server-Side Rendering
- Enables dynamic rendering and API routes
- Provides compute resources for server-side operations
- Without this, only static site generation (SSG) is supported

**Next.js - SSR Framework**:

- Optimizes build process for Next.js SSR
- Configures runtime environment correctly
- Ensures proper handling of server components

### Manual Configuration

If you're working with an existing Amplify app or need to update these settings:

```bash
cd deployment/pulumi

# Automatic (uses Pulumi outputs)
./configure-amplify.sh

# Manual with environment variables
AMPLIFY_APP_ID=your-app-id AWS_REGION=us-east-1 ./configure-amplify.sh
```

### Verification

Verify your Amplify configuration:

```bash
# From Pulumi outputs
APP_ID=$(pulumi stack output amplifyAppId)
REGION=$(pulumi config get aws:region)

# Check platform
aws amplify get-app --app-id $APP_ID --region $REGION | jq -r '.app.platform'
# Expected: WEB_COMPUTE

# Check framework
aws amplify get-branch --app-id $APP_ID --branch-name main --region $REGION | jq -r '.branch.framework'
# Expected: Next.js - SSR
```

## Next Steps

After configuring, proceed with deployment:

1. **Review configuration**: `pulumi config`
2. **Preview changes**: `pulumi preview`
3. **Deploy infrastructure**: `pulumi up`
4. **View outputs**: `pulumi stack output`
5. **Verify Amplify settings**: See "Amplify Platform Configuration" above

See [README.md](./README.md) for complete deployment guide.
