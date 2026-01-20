# Stage 1: Build
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy package files using your specific paths
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Stage 2: Runtime
FROM oven/bun:1-alpine
WORKDIR /app

# Copy the specific app and shared folders
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/backend ./apps/backend
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/backend

# Copy the startup script and give it execution permissions
COPY apps/backend/start.sh ./start.sh
RUN chmod +x ./start.sh


EXPOSE 3000

USER bun

# Use the script to start the container
CMD ["./start.sh"]
