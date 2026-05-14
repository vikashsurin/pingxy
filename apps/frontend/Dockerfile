# Stage 1: Base
FROM oven/bun:1-alpine AS base
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
RUN bun install

# Stage 2: Development
FROM base AS development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
# Polling required for hot reload inside Docker on Mac/Windows
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
WORKDIR /app/apps/frontend
# Source is mounted via volume — see docker-compose.yml
CMD ["bun", "run", "dev"]

# Stage 3: Builder
FROM base AS builder
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/apps/frontend
RUN bun run build

# Stage 4: Production Runtime
FROM oven/bun:1-alpine AS production
WORKDIR /app

# The standalone output includes the necessary node_modules
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

USER bun
# Note: In a monorepo, server.js might be inside apps/frontend/
CMD ["bun", "apps/frontend/server.js"]
