# Stage 1: Build
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
COPY package.json bun.lock ./

RUN bun install

COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend
RUN bun run build

# Stage 2: Export static files
FROM alpine
WORKDIR /app/frontend
COPY --from=builder /app/apps/frontend/dist ./dist