# Getting Started

Welcome to the gluestack Universal React Monorepo! This guide will help you get up and running.

## Prerequisites

- **Node.js**: >= 20.0.0 (LTS recommended)
- **pnpm**: >= 10.0.0
- **PostgreSQL**: >= 14 (for database development)
- **Docker**: (optional, for local PostgreSQL)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gluestack-universal-react-monorepo
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   For the API:

   ```bash
   cd apps/api
   cp .env.example .env
   # Edit .env with your configuration
   ```

   For the database:

   ```bash
   cd packages/database
   cp .env.example .env
   # Add your DATABASE_URL
   ```

4. **Start PostgreSQL** (if using Docker)

   ```bash
   docker run --name postgres-dev \
     -e POSTGRES_PASSWORD=dev \
     -e POSTGRES_DB=dev \
     -p 5432:5432 \
     -d postgres:16
   ```

5. **Run database migrations**
   ```bash
   pnpm --filter database db:migrate
   ```

## Development

### Run All Apps

```bash
pnpm dev
```

This starts:

- Web app (Next.js) on `http://localhost:3000`
- Mobile app (Expo) on `http://localhost:8081`
- API server on `http://localhost:3030`

### Run Specific Apps

```bash
# Web app only
pnpm --filter web dev

# Mobile app only
pnpm --filter mobile dev

# API server only
pnpm --filter api dev
```

### Mobile Development

```bash
cd apps/mobile

# iOS simulator
pnpm ios

# Android emulator
pnpm android

# Web browser
pnpm web
```

## Project Structure

```
.
├── apps/
│   ├── api/          # Fastify API server
│   ├── mobile/       # Expo React Native app
│   └── web/          # Next.js web app
├── packages/
│   ├── components/   # Shared UI components
│   ├── ui/           # Shared screens & logic
│   ├── database/     # Drizzle ORM schemas
│   ├── errors/       # Error classes
│   ├── service-contracts/ # Shared types
│   ├── utils/        # Utility functions
│   ├── tailwind-config/   # Shared Tailwind config
│   └── typescript-config/ # Shared TS config
├── docs/             # Documentation
├── CLAUDE.md         # AI assistant instructions
├── turbo.json        # Turborepo config
└── pnpm-workspace.yaml  # pnpm workspaces
```

## Common Commands

```bash
# Build all apps
pnpm build

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run tests
pnpm test

# Clean build artifacts
pnpm clean
```

## Next Steps

- [Architecture Overview](./architecture/overview.md)
- [API Documentation](./api/README.md)
- [Package Documentation](./packages/README.md)
- [Development Guides](./guides/README.md)
- [Testing Guide](./guides/testing.md)

## Troubleshooting

### Port Already in Use

If you get a port conflict:

- Web: Change port in `apps/web/.env.local`
- API: Change `PORT` in `apps/api/.env`
- Mobile: Expo will automatically find an available port

### Database Connection Errors

- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run migrations: `pnpm --filter database db:migrate`

### Module Resolution Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Type Errors

```bash
# Rebuild all packages
pnpm build

# Or build specific package
pnpm --filter database build
```

## Additional Resources

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Expo Docs](https://docs.expo.dev/)
- [Fastify Docs](https://fastify.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Gluestack UI Docs](https://ui.gluestack.io/)
