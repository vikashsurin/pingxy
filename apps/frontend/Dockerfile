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

# Stage 2: Production Runtime
FROM oven/bun:1-alpine
WORKDIR /app

# Copy only the build output from the builder stage
# Svelte-adapter-bun usually outputs to a 'build' folder
COPY --from=builder /app/apps/frontend/build ./build

# Set environment variables (optional but recommended)
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port your app runs on
# This port is overridden by docker-compose exposed ports
EXPOSE 3001

# Start the server using Bun
CMD ["bun", "./build/index.js"]