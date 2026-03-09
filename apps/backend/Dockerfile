# Stage 1: Base & Dependencies
FROM oven/bun:1-alpine AS base
# Added build-base, vips-dev, and fftw-dev for Sharp's native compilation
RUN apk add --no-cache postgresql-client build-base vips-dev fftw-dev
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN bun install

# Stage 2: Development
FROM base AS development
# Add ffmpeg here so it's available during local dev inside the container
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
CMD ["bun", "--hot", "run", "src/index.ts"]

# Stage 3: Builder (Production)
FROM base AS builder
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN bunx drizzle-kit generate

# Stage 4: Production Runtime
FROM oven/bun:1-alpine AS production
# Essential: ffmpeg for video thumbnails and vips for Sharp image processing
RUN apk add --no-cache ffmpeg vips
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/backend ./apps/backend
WORKDIR /app/apps/backend
USER bun
CMD ["bun", "run", "start"]
