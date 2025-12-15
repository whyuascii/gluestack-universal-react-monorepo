# Concepts

Understanding how the Universal React Monorepo works - the architecture, design decisions, and cross-platform strategy.

> **Looking for step-by-step guides?** Check out [../guides/](../guides/) instead.

---

## What's in This Section

This section explains **WHY** and **HOW** the system works, not how to use it.

### 📐 [Architecture](./architecture.md)

High-level system design:

- System overview and component diagram
- Request/response flow
- Technology stack and rationale
- Deployment architecture

**Read this to understand:**

- How web, mobile, and API communicate
- Data flow through the system
- Infrastructure components

### 🔄 [Cross-Platform Strategy](./cross-platform.md)

How 80%+ code sharing is achieved:

- Shared component architecture
- Platform abstraction patterns
- React Native Web usage
- Platform-specific code organization

**Read this to understand:**

- Why components work on both web and mobile
- How NativeWind enables Tailwind on React Native
- When to write platform-specific code

### 📦 [Monorepo Structure](./monorepo-structure.md)

Package organization and dependencies:

- Package layering strategy
- Dependency graph
- Workspace configuration
- Build pipeline (Turborepo)

**Read this to understand:**

- Why packages are organized this way
- Dependency rules and boundaries
- How Turborepo optimizes builds

### 🗄️ [Database Schema](./database-schema.md)

Data model and relationships:

- Entity-relationship diagram
- Table descriptions
- Multitenant design
- Better Auth integration

**Read this to understand:**

- Database structure and relationships
- How tenants, users, and auth tables work together
- Data integrity constraints

---

## When to Read This

**Before building features:**

- Understand the system architecture first
- Learn how cross-platform sharing works
- Know where your code should live

**When making architectural decisions:**

- See what patterns already exist
- Understand trade-offs
- Check ADRs for historical context

**When onboarding:**

- Get the mental model of the system
- Understand design principles
- Learn the "why" behind decisions

---

## Related Documentation

- **[Guides](../guides/)** - How to accomplish specific tasks
- **[Reference](../reference/)** - API documentation
- **[ADRs](../adr/)** - Historical architectural decisions
