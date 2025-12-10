# Documentation

Welcome to the documentation for the gluestack Universal React Monorepo.

## Quick Links

- [Getting Started](./getting-started.md)
- [Architecture Overview](./architecture/overview.md)
- [API Documentation](./api/README.md)
- [Package Documentation](./packages/README.md)
- [Development Guides](./guides/README.md)
- [Architecture Decision Records (ADRs)](./adr/README.md)

## Documentation Structure

```
docs/
├── README.md                    # This file
├── getting-started.md          # Quick start guide
├── architecture/               # Architecture documentation
│   ├── README.md
│   ├── overview.md
│   ├── monorepo-structure.md
│   └── cross-platform.md
├── api/                        # API server documentation
│   ├── README.md
│   ├── getting-started.md
│   ├── routes.md
│   ├── error-handling.md
│   └── testing.md
├── packages/                   # Package-specific docs
│   ├── README.md
│   ├── components.md
│   ├── ui.md
│   ├── database.md
│   ├── errors.md
│   ├── service-contracts.md
│   └── utils.md
├── guides/                     # How-to guides
│   ├── README.md
│   ├── adding-components.md
│   ├── creating-routes.md
│   ├── database-migrations.md
│   ├── testing.md
│   └── monorepo-best-practices.md
└── adr/                        # Architecture Decision Records
    ├── README.md
    ├── template.md
    └── NNNN-title.md

```

## Contributing to Documentation

When adding or updating documentation:

1. Keep it concise and focused
2. Use code examples where appropriate
3. Update the relevant README.md files
4. Follow the existing structure and style
5. Consider creating an ADR for significant architectural decisions
