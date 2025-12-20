#!/bin/sh
set -e

echo "Running database migrations..."
pnpm --filter @app/database db:migrate

echo "Starting API server..."
exec node apps/api/dist/index.js
