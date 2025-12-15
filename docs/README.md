# Documentation

Comprehensive documentation for the Universal React Monorepo - a cross-platform template for building web and mobile applications with maximum code sharing.

> **New to this project?** Start with the [root README](../README.md) for a quick overview, then come back here for detailed information.

---

## 📖 Three Types of Documentation

### 🎓 [Concepts](./concepts/) - Understanding the System

**What it is:** Architecture, design decisions, and how things work together

**Read this to understand:**

- System architecture and design
- Why things are organized the way they are
- How cross-platform code sharing works
- Database schema and relationships

**Sections:**

- [Architecture](./concepts/architecture.md) - System design and component interaction
- [Cross-Platform Strategy](./concepts/cross-platform.md) - How 80%+ code sharing works
- [Monorepo Structure](./concepts/monorepo-structure.md) - Package organization and dependencies
- [Database Schema](./concepts/database-schema.md) - Entity relationships and data model

### 📚 [Guides](./guides/) - How to Do Things

**What it is:** Step-by-step tutorials for accomplishing specific tasks

**Use these to:**

- Implement features
- Set up services
- Learn workflows
- Follow best practices

**Categories:**

- **[API Development](./guides/api/)** - Creating routes, error handling, testing
- **[Frontend Development](./guides/frontend/)** - Screens, components, styling
- **[Database Operations](./guides/database/)** - Migrations, queries, seeding
- **[Feature Implementation](./guides/features/)** - Auth, analytics, subscriptions, i18n
- **[Development Workflows](./guides/development/)** - Testing, debugging, monorepo practices

### 📖 [Reference](./reference/) - API Documentation

**What it is:** Detailed API specifications and package exports

**Use this to:**

- Look up function signatures
- Check component props
- Find available utilities
- Understand API endpoints

**Sections:**

- **[API Endpoints](./reference/api-endpoints/)** - REST API specifications
- **[Package APIs](./reference/packages/)** - Package exports and interfaces

---

## 🚦 Quick Navigation

### New to the Project?

1. **[Root README](../README.md)** - 5-minute overview and quick start
2. **[Getting Started](./getting-started.md)** - Detailed setup and troubleshooting
3. **[Concepts](./concepts/)** - Understand the architecture
4. **[Guides](./guides/)** - Start building

### Looking for Something Specific?

**I want to...**

**...get set up and running**
→ [Getting Started Guide](./getting-started.md)

**...understand the architecture**
→ [Architecture](./concepts/architecture.md) | [Cross-Platform](./concepts/cross-platform.md) | [Monorepo](./concepts/monorepo-structure.md)

**...build features**
→ **API:** [Creating Routes](./guides/api/creating-routes.md)
→ **Frontend:** [Adding Components](./guides/frontend/adding-components.md)
→ **Database:** [Migrations](./guides/database/migrations.md) | [Queries](./guides/database/queries.md)

**...implement services**
→ [Authentication](./guides/features/authentication.md) | [Analytics](./guides/features/analytics.md) | [Subscriptions](./guides/features/subscriptions.md) | [i18n](./guides/features/internationalization.md)

**...test and debug**
→ [Testing](./guides/development/testing.md) | [Debugging](./guides/development/debugging.md)

**...look up APIs**
→ [API Endpoints](./reference/api-endpoints/) | [Packages](./reference/packages/)

**...troubleshoot issues**
→ [Getting Started - Troubleshooting](./getting-started.md#troubleshooting) | [Common Pitfalls](./getting-started.md#common-pitfalls)

---

## 📂 Documentation Structure

```
docs/
├── README.md                    # This file - main navigation
├── getting-started.md           # Detailed setup & troubleshooting
│
├── concepts/                    # Understanding the system
│   ├── README.md
│   ├── architecture.md          # System design
│   ├── cross-platform.md        # Code sharing strategy
│   ├── monorepo-structure.md    # Package organization
│   └── database-schema.md       # Data model & relationships
│
├── guides/                      # Step-by-step tutorials
│   ├── README.md
│   ├── api/                     # API development
│   │   ├── creating-routes.md
│   │   └── error-handling.md
│   ├── frontend/                # UI development
│   │   └── adding-components.md
│   ├── database/                # Database operations
│   │   ├── migrations.md
│   │   └── queries.md
│   ├── features/                # Feature implementation
│   │   ├── authentication.md
│   │   ├── analytics.md
│   │   ├── error-tracking.md
│   │   └── subscriptions.md
│   └── development/             # Development workflows
│       ├── testing.md
│       └── monorepo-workflow.md
│
├── reference/                   # API documentation
│   ├── README.md
│   ├── api-endpoints/           # REST API specs
│   │   └── README.md
│   └── packages/                # Package APIs
│       ├── README.md
│       ├── auth.md
│       ├── database.md
│       ├── components.md
│       ├── ui.md
│       └── ...
│
└── adr/                         # Architecture decisions
    ├── README.md
    └── template.md
```

---

## ✍️ Contributing to Documentation

### When to Update Documentation

**Always update docs when you:**

- Add a new feature or package
- Change API contracts or interfaces
- Modify development workflows
- Make architectural decisions
- Fix a bug that wasn't obvious

### Documentation Guidelines

1. **Be concise** - Get to the point quickly
2. **Use examples** - Show, don't just tell
3. **Think about the reader** - What are they trying to accomplish?
4. **Keep it current** - Update docs when code changes
5. **Link liberally** - Connect related documentation

### Adding New Documentation

**For new features:**

1. Add a how-to guide in `guides/`
2. Update relevant package docs in `packages/`
3. Add examples and code snippets
4. Update this README's "I want to..." section

**For architectural changes:**

1. Create an ADR in `adr/` (use `template.md`)
2. Update architecture docs if structure changed
3. Update package docs if APIs changed

**For new packages:**

1. Create package doc in `packages/`
2. Explain purpose, API, and usage
3. Add to package overview in `packages/README.md`
4. Update architecture docs

### Documentation Style

**Code Examples:**

```typescript
// ✅ Good: Complete, runnable example
import { useAuth } from "auth/client/react";

function LoginButton() {
  const { signIn } = useAuth();
  return <button onClick={() => signIn.email({ email, password })}>Login</button>;
}

// ❌ Bad: Incomplete, unclear
useAuth().signIn.email(...);
```

**Explanations:**

- Start with "why" before "how"
- Use bullet points for lists
- Use headers to organize sections
- Include links to related docs

---

## 🔍 Finding What You Need

**Can't find what you're looking for?**

1. Check the ["I want to..." section](#i-want-to) above
2. Search the codebase: `grep -r "your-search-term" docs/`
3. Ask in [GitHub Discussions](https://github.com/YOUR_USERNAME/YOUR_REPO/discussions)
4. Check the [root README](../README.md) for high-level overview

**Documentation feels incomplete?**

Open an issue or PR! The best documentation comes from real developer questions and use cases.
