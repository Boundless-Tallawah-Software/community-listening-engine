#!/bin/bash

# Production release script for Community Listening Engine
# Sets the correct deploy URL and performs build/deployment

set -e  # Exit on any error

echo "Starting production release process..."

# Set environment variables based on deployment target
if [ "$1" = "production" ]; then
    echo "Deploying to production environment"
    DEPLOY_URL="https://ask.boundless-tallawah.com"
elif [ "$1" = "staging" ]; then
    echo "Deploying to staging environment"
    DEPLOY_URL="https://stage-ask.boundless-tallawah.com"
else
    echo "Usage: $0 {production|staging}"
    exit 1
fi

# Validate required tools
if ! command -v wrangler &> /dev/null; then
    echo "wrangler CLI not found. Please install it with 'npm install -g wrangler'"
    exit 1
fi

# Check if we're in the project root directory
if [ ! -f "package.json" ]; then
    echo "Error: This script must be run from the project root directory"
    exit 1
fi

# Run linting (if configured)
echo "Running lint checks..."
npm run lint || echo "Linting skipped or failed"

# Build the project
echo "Building project..."
npm run build

# Deploy using wrangler
echo "Deploying to $DEPLOY_URL..."
wrangler deploy

echo "Production release completed successfully!"
echo "Deployed to: $DEPLOY_URL"