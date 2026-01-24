# Stage 1: Base & Dependencies
FROM oven/bun:1-alpine AS base
RUN apk add --no-cache postgresql-client
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN bun install

# Stage 2: Development (Used by docker-compose.dev.yml)
FROM base AS development
WORKDIR /app
# Copy everything for development (volumes will override)
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
# Use --watch instead of --hot for better file system watching
CMD ["bun", "run", "--watch", "src/index.ts"]

# Stage 3: Builder (Production)
FROM base AS builder
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN bunx drizzle-kit generate

# Stage 4: Production Runtime
FROM oven/bun:1-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/backend ./apps/backend
WORKDIR /app/apps/backend
USER bun
CMD ["bun", "run", "start"]
