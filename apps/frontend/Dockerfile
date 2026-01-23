FROM oven/bun:1-alpine AS base
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
RUN bun install

# Stage 2: Development
FROM base AS development
WORKDIR /app/apps/frontend
# Note: Ensure your svelte dev script in package.json uses --host
CMD ["bun", "run", "dev", "--", "--host"]

# Stage 3: Builder
FROM base AS builder
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend
WORKDIR /app/apps/frontend
RUN bun run build

# Stage 4: Production Runtime
FROM oven/bun:1-alpine AS production
WORKDIR /app
COPY --from=builder /app/apps/frontend/build ./build
ENV NODE_ENV=production
USER bun
CMD ["bun", "./build/index.js"]