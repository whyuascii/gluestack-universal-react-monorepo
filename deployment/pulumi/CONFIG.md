# Configuration Guide

This guide explains all configuration options for the infrastructure deployment.

## Configuration Overview

All configuration is managed through Pulumi config. Configuration values are stored per stack, allowing different settings for dev, staging, and production environments.

## Required Configuration

These settings **must** be configured before deploying:

### 1. Database Password

```bash
pulumi config set --secret dbPassword "$(openssl rand -base64 32)"
```

**Purpose**: PostgreSQL database password
**Security**: Stored encrypted in Pulumi state
**Recommendation**: Use auto-generated strong password (32+ characters)

### 2. Better Auth Secret

```bash
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"
```

**Purpose**: Session signing and encryption for Better Auth
**Security**: Stored encrypted in Pulumi state
**Recommendation**: Use auto-generated strong secret (32+ characters)

### 3. GitHub Repository Settings

```bash
pulumi config set githubOwner YOUR_GITHUB_USERNAME
pulumi config set githubRepo your-repo-name
pulumi config set githubBranch main
```

**Purpose**: Amplify connects to GitHub for automatic deployments
**Note**: Repository must exist and be accessible

### 4. AWS Region

```bash
pulumi config set aws:region us-east-1
```

**Purpose**: AWS region for all resources
**Options**: Any AWS region (e.g., us-east-1, us-west-2, eu-west-1)
**Recommendation**: Choose region closest to your users

## Optional Configuration

### Project Name

```bash
pulumi config set projectName myapp
```

**Default**: `app`
**Purpose**: Prefix for all AWS resource names
**Format**: Lowercase alphanumeric, hyphens allowed
**Example**: If `projectName=myapp` and stack is `dev`, Supabase instance will be `myapp-db-dev`

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

# Required
pulumi config set aws:region us-east-1
pulumi config set --secret dbPassword "$(openssl rand -base64 32)"
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"
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

# Required
pulumi config set aws:region us-east-1
pulumi config set projectName mycompany
pulumi config set --secret dbPassword "$(openssl rand -base64 32)"
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"
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
# Development
pulumi stack init dev
pulumi config set aws:region us-east-1
pulumi config set projectName myapp
pulumi config set --secret dbPassword "$(openssl rand -base64 32)"
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"
# ... other dev settings
pulumi up

# Staging
pulumi stack init staging
pulumi config set aws:region us-east-1
pulumi config set projectName myapp
pulumi config set --secret dbPassword "$(openssl rand -base64 32)"
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"
# ... other staging settings
pulumi up

# Production
pulumi stack init prod
pulumi config set aws:region us-east-1
pulumi config set projectName myapp
pulumi config set domain myapp.com
pulumi config set --secret dbPassword "$(openssl rand -base64 32)"
pulumi config set --secret betterAuthSecret "$(openssl rand -base64 32)"
# ... other prod settings
pulumi up
```

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

| Configuration        | Required | Secret | Default                    | Purpose              |
| -------------------- | -------- | ------ | -------------------------- | -------------------- |
| `aws:region`         | ✅       | ❌     | -                          | AWS region           |
| `dbPassword`         | ✅       | ✅     | -                          | Database password    |
| `betterAuthSecret`   | ✅       | ✅     | -                          | Auth signing secret  |
| `githubOwner`        | ✅       | ❌     | -                          | GitHub username/org  |
| `githubRepo`         | ✅       | ❌     | -                          | Repository name      |
| `githubBranch`       | ✅       | ❌     | `main`                     | Git branch           |
| `projectName`        | ❌       | ❌     | `app`                      | Resource name prefix |
| `githubToken`        | ❌       | ✅     | -                          | For private repos    |
| `domain`             | ❌       | ❌     | -                          | Custom domain        |
| `googleClientId`     | ❌       | ✅     | -                          | Google OAuth         |
| `googleClientSecret` | ❌       | ✅     | -                          | Google OAuth         |
| `githubClientId`     | ❌       | ✅     | -                          | GitHub OAuth         |
| `githubClientSecret` | ❌       | ✅     | -                          | GitHub OAuth         |
| `posthogKey`         | ❌       | ✅     | -                          | PostHog analytics    |
| `posthogHost`        | ❌       | ❌     | `https://us.i.posthog.com` | PostHog host         |

## Next Steps

After configuring, proceed with deployment:

1. **Review configuration**: `pulumi config`
2. **Preview changes**: `pulumi preview`
3. **Deploy infrastructure**: `pulumi up`
4. **View outputs**: `pulumi stack output`

See [README.md](./README.md) for complete deployment guide.
