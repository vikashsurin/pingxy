FROM oven/bun:1-alpine
WORKDIR /app

# Copy backend and shared into the image
COPY backend ./backend
COPY shared ./shared

# Install from inside backend
WORKDIR /app/backend
RUN bun install

# Install dependencies
WORKDIR /app/shared
RUN bun install

WORKDIR /app/backend

EXPOSE 3000
CMD ["bun", "run", "dev"]
