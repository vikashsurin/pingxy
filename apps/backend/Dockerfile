# Stage 1: Build
FROM oven/bun:1-alpine AS builder

RUN apk add --no-cache postgresql-client

WORKDIR /app

# 1. Copy package files to install dependencies
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

RUN bun install

# 2. Copy the actual source code
# This is crucial: the relative path from backend to shared must be preserved
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# 3. Generate migrations
# We go into the backend folder where the config lives
WORKDIR /app/apps/backend
RUN bunx drizzle-kit generate

# Stage 2: Runtime
FROM oven/bun:1-alpine
WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/backend ./apps/backend


COPY --from=builder /app/apps/backend/drizzle ./apps/backend/drizzle

WORKDIR /app/apps/backend

EXPOSE 3000
USER bun

CMD ["bun","run", "start"]