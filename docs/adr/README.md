# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the gluestack Universal React Monorepo project.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences.

## When to Create an ADR

Create an ADR when you make a significant architectural decision that:

- Affects the structure of the codebase
- Has long-term implications
- Involves trade-offs between different approaches
- Impacts multiple teams or packages
- Changes the technology stack
- Establishes patterns or conventions

## Naming Convention

ADRs should be named following this pattern:

```
NNNN-title-with-dashes.md
```

Where:

- `NNNN` is a sequential number (e.g., 0001, 0002, 0003)
- `title-with-dashes` is a short, descriptive title in kebab-case

Examples:

- `0001-use-drizzle-orm-for-database.md`
- `0002-adopt-gluestack-ui-for-components.md`
- `0003-use-pnpm-workspaces-for-monorepo.md`

## How to Create an ADR

1. Copy the [template.md](./template.md) file
2. Rename it following the naming convention above
3. Fill in all sections of the template
4. Submit a pull request for review
5. Add a link to the ADR in the [index below](#index)

## ADR Lifecycle

ADRs can have the following statuses:

- **Proposed**: The ADR is under discussion
- **Accepted**: The decision has been made and is being implemented
- **Deprecated**: The decision has been superseded by a newer ADR
- **Superseded**: Link to the ADR that replaces this one

## Index

<!-- Add links to ADRs here as they are created -->

### Accepted

- [0001 - Use Drizzle ORM with PostgreSQL](./0001-use-drizzle-orm-with-postgresql.md)
- [0002 - Adopt Gluestack UI v3 for Cross-Platform Components](./0002-adopt-gluestack-ui-v3.md)

### Proposed

<!-- Add proposed ADRs here -->

### Deprecated

<!-- Add deprecated ADRs here -->

## Resources

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
