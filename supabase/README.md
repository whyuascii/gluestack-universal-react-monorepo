# Supabase Local Development

This directory contains configuration for [Supabase Local](https://supabase.com/docs/guides/local-development), which provides a complete local PostgreSQL development environment.

> **Note:** This is **optional**. You can also use the simpler Docker Compose setup (see [Alternative: Docker Compose](#alternative-docker-compose) below).

## Quick Comparison

| Feature            | Supabase Local                    | Docker Compose        |
| ------------------ | --------------------------------- | --------------------- |
| Setup complexity   | More tools to install             | Just Docker           |
| PostgreSQL version | 17                                | 16                    |
| Database GUI       | Supabase Studio (:54323)          | Use Drizzle Studio    |
| Email testing      | Mailpit built-in (:54324)         | Not included          |
| Extra features     | Storage, Realtime, Edge Functions | Database only         |
| Resource usage     | Higher (full stack)               | Lower (just Postgres) |

**Recommendation:** Use Supabase Local if you want the GUI and email testing. Use Docker Compose for a lighter setup.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be running
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) installed

```bash
# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

## Quick Start

```bash
# Start Supabase (from project root)
supabase start

# Check status (shows all URLs and credentials)
supabase status

# Stop Supabase
supabase stop
```

## Environment Setup

After running `supabase start`, configure your `.env`:

```bash
# Database connection for Supabase Local
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

Then run migrations:

```bash
pnpm --filter database db:migrate
```

## Connection Details

| Service         | URL                                                       | Purpose                             |
| --------------- | --------------------------------------------------------- | ----------------------------------- |
| Database        | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | App database                        |
| Supabase Studio | http://127.0.0.1:54323                                    | Database GUI                        |
| Mailpit         | http://127.0.0.1:54324                                    | Email testing                       |
| API             | http://127.0.0.1:54321                                    | Supabase API (not used by this app) |

## Database Tools

This project uses **Drizzle ORM** for database management, not Supabase migrations:

```bash
# Run migrations
pnpm --filter database db:migrate

# Generate migration after schema changes
pnpm --filter database generate

# Open Drizzle Studio (alternative to Supabase Studio)
pnpm --filter database db:studio
```

You can use either Supabase Studio (port 54323) or Drizzle Studio for viewing/editing data.

## Email Testing with Mailpit

Supabase Local includes [Mailpit](http://127.0.0.1:54324) for testing emails. This is useful for:

- Testing auth emails (verification, password reset)
- Testing notification emails from Novu/Resend
- Previewing email templates without sending real emails

> **Note:** This app uses **Better Auth** for authentication and **Resend** for emails, not Supabase Auth. Mailpit catches emails sent via Resend's test mode.

To capture emails locally, configure Resend in test mode or use Mailpit's SMTP:

- SMTP Host: `127.0.0.1`
- SMTP Port: `54325` (if enabled in config.toml)

## Seed Data

To add seed data, create `supabase/seed.sql`:

```sql
-- Example seed data
INSERT INTO users (email, name) VALUES
  ('test@example.com', 'Test User');
```

The seed runs automatically during `supabase db reset`.

## Configuration

The `config.toml` file configures your local instance. Key settings:

| Setting            | Value   | Description        |
| ------------------ | ------- | ------------------ |
| `project_id`       | `app`   | Project identifier |
| `db.port`          | `54322` | PostgreSQL port    |
| `db.major_version` | `17`    | PostgreSQL version |
| `studio.port`      | `54323` | Studio GUI port    |
| `inbucket.port`    | `54324` | Mailpit port       |

See [Supabase config reference](https://supabase.com/docs/guides/local-development/cli/config) for all options.

## Alternative: Docker Compose

For a simpler setup without the full Supabase stack:

```bash
# Start just PostgreSQL (port 5432)
docker compose up db -d

# Or use the quick Docker command
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app \
  -p 5432:5432 \
  -d postgres:16
```

Then update your `.env`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app
```

## Troubleshooting

**Docker not running:**

```
Error: Cannot connect to the Docker daemon
```

Start Docker Desktop and try again.

**Port conflicts:**

```
Error: port 54322 is already in use
```

Another service is using the port. Stop it or modify ports in `config.toml`.

**Reset database (keeps schema):**

```bash
supabase stop
supabase start
pnpm --filter database db:migrate
```

**Full reset (deletes all data):**

```bash
supabase db reset
```

**View logs:**

```bash
supabase logs
```

## Files

```
supabase/
├── config.toml     # Supabase configuration
├── seed.sql        # Seed data (optional, create if needed)
├── .gitignore      # Ignores temp files
└── README.md       # This file
```
