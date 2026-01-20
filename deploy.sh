#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment..."

# 1. Pull the latest code from your repository
echo "📥 Pulling latest changes..."
git pull origin main

# 2. Build and start the containers in detached mode
# --build ensures Docker ignores old cache if files changed
echo "🏗️ Building and starting containers..."
docker compose up --build -d

# 3. Clean up unused images to save server space
# This removes 'dangling' images left over from previous builds
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment successful! Your app is live."
