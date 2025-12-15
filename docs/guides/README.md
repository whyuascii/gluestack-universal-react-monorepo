# Guides

Step-by-step tutorials for accomplishing specific tasks in the Universal React Monorepo.

> **Looking for API reference?** Check out [../reference/](../reference/) instead.
> **Want to understand the system?** See [../concepts/](../concepts/) for architecture details.

---

## Guide Categories

### 🔌 API Development

**[guides/api/](./api/)**

Building and maintaining the Fastify API server:

- **[Creating Routes](./api/creating-routes.md)** - Add new API endpoints with Zod validation
- **[Error Handling](./api/error-handling.md)** - Structured error responses and logging
- **[API Testing](./api/testing-api.md)** - Writing integration tests for routes

### 🎨 Frontend Development

**[guides/frontend/](./frontend/)**

Building cross-platform UI:

- **[Creating Screens](./frontend/creating-screens.md)** - Build screens that work on web and mobile
- **[Adding Components](./frontend/adding-components.md)** - Create reusable UI components
- **[Styling Guide](./frontend/styling.md)** - Tailwind + NativeWind best practices

### 🗄️ Database Operations

**[guides/database/](./database/)**

Working with PostgreSQL and Drizzle ORM:

- **[Migrations](./database/migrations.md)** - Creating and applying database migrations
- **[Queries](./database/queries.md)** - Writing type-safe database queries
- **[Seeding](./database/seeding.md)** - Populating database with test data

### ✨ Feature Implementation

**[guides/features/](./features/)**

Implementing specific product features:

- **[Authentication](./features/authentication.md)** - Setting up Better Auth with OAuth
- **[Analytics](./features/analytics.md)** - PostHog event tracking and dashboards
- **[Error Tracking](./features/error-tracking.md)** - Error monitoring with PostHog
- **[Subscriptions](./features/subscriptions.md)** - RevenueCat in-app purchases
- **[Internationalization](./features/internationalization.md)** - i18next multi-language support

### 🛠️ Development Workflows

**[guides/development/](./development/)**

Team practices and workflows:

- **[Testing](./development/testing.md)** - Unit, integration, and E2E testing
- **[Monorepo Workflow](./development/monorepo-workflow.md)** - Working in a monorepo effectively
- **[Debugging](./development/debugging.md)** - Debug strategies for web, mobile, and API

---

## How to Use These Guides

### For New Features

1. **Plan** - Understand requirements
2. **Design** - Review relevant [concepts](../concepts/)
3. **Build** - Follow applicable guides
4. **Test** - Use [testing guide](./development/testing.md)
5. **Deploy** - See deployment docs

### For Learning

- **Start with basics** - Database, API, Frontend guides
- **Add features** - Authentication, Analytics guides
- **Optimize workflow** - Development guides

### For Reference

- Need quick syntax? → [Reference docs](../reference/)
- Need to understand why? → [Concepts](../concepts/)
- Need step-by-step? → **You're in the right place!**

---

## Contributing to Guides

### Adding a New Guide

1. **Choose the right category** - api, frontend, database, features, or development
2. **Create the file** - Use descriptive filename (e.g., `adding-oauth-providers.md`)
3. **Follow the template** - See [guide-template.md](./guide-template.md)
4. **Update this README** - Add your guide to the appropriate section
5. **Link from other docs** - Update related guides and concepts

### Guide Template Structure

```markdown
# Guide Title

Brief description of what this guide covers.

## Prerequisites

- Thing you need
- Another prerequisite

## Step 1: First Thing

Detailed instructions...

## Step 2: Next Thing

More instructions...

## Testing

How to verify it works...

## Troubleshooting

Common issues and solutions...

## Related Documentation

- [Related Guide](./related.md)
- [Package Reference](../reference/packages/foo.md)
```

### Style Guidelines

**DO:**

- ✅ Use code examples liberally
- ✅ Provide full, runnable code blocks
- ✅ Include expected output
- ✅ Link to related documentation
- ✅ Explain "why" not just "what"

**DON'T:**

- ❌ Assume prior knowledge
- ❌ Use incomplete code snippets
- ❌ Skip error handling examples
- ❌ Leave steps vague or ambiguous
