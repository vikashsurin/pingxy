FROM oven/bun:1-alpine
WORKDIR /app

# Copy backend and shared into the image
COPY backend ./backend
COPY shared ./shared

# Install from inside backend
WORKDIR /app/backend
RUN bun install

EXPOSE 3000
CMD ["bun", "run", "dev"]
