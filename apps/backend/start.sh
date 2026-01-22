#!/bin/sh
set -e

echo "Waiting for database to be fully ready at ${DATABASE_URL}..."

# Use the native pg_isready command
# It will parse the connection string directly
until pg_isready -d "${DATABASE_URL}"; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is up! Running database migrations..."
bun run db:migrate 

echo "Starting the application..."
exec bun run start