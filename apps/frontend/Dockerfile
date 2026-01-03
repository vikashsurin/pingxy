FROM oven/bun:1-alpine
WORKDIR /app

COPY frontend ./frontend
COPY shared ./shared

WORKDIR /app/frontend
RUN bun install

WORKDIR /app/shared
RUN bun install

WORKDIR /app/frontend

EXPOSE 5173
CMD ["bun", "--bun", "dev", "--host", "0.0.0.0", "--port", "5173"]
