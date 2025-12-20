# Builder Stage
# -------------
# This stage uses turbo prune to create a minimal subset of the monorepo
FROM node:20-bookworm-slim AS builder

# Set app directory within docker
WORKDIR /app

# Install turbo globally
RUN npm install -g turbo@2.6.3

# Copy entire project for pruning
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/ ./apps/
COPY packages/ ./packages/

# Prune the monorepo to only include dependencies for the API
RUN turbo prune --scope=@app/api --docker


# Installer Stage
# -------------
# This stage installs dependencies and builds the application
FROM node:20-bookworm-slim AS installer

# Set app directory within docker
WORKDIR /app

# Install pnpm
RUN --mount=type=cache,target=/root/.npm npm install -g pnpm@10.15.0

# Copy lockfile and package.json files from pruned output
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy source code from pruned output (before installing to avoid conflicts)
COPY --from=builder /app/out/full/ .

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

# Build the API and its dependencies
RUN pnpm build --filter=@app/api...


# Runner Stage
# -------------
# This is the final production image that runs the compiled application
FROM node:20-bookworm-slim AS runner

# Update package lists & install latest zlib and minizip
RUN apt-get update && apt-get install -y \
    zlib1g \
    minizip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm globally for runtime
RUN npm install -g pnpm@10.15.0

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built application and dependencies
COPY --from=installer --chown=appuser:nodejs /app ./

# Copy startup script
COPY --chown=appuser:nodejs apps/api/scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Switch to non-root user
USER appuser

# Expose API port
EXPOSE 3030

# Set environment to production
ENV NODE_ENV="production"

# Run migrations then start the application
CMD ["/app/start.sh"]
