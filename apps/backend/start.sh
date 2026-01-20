#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Running database migrations..."
# Adjust this command based on your package.json script (e.g., drizzle-kit push or a custom migrate script)
bun run db:migrate 

echo "Starting the application..."
exec bun run start