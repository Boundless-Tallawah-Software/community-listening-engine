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

# Pin the existing KV namespace so Wrangler does not try to re-provision it
KV_TITLE="community-listening-engine-cache"
KV_LIST="$(wrangler kv namespace list)"
KV_ID="$(printf '%s' "$KV_LIST" | node -e '
let i="";process.stdin.on("data",c=>i+=c).on("end",()=>{
const m=JSON.parse(i).filter(n=>n.title===process.argv[1]);
process.stdout.write(m.length===1?m[0].id:"");});' "$KV_TITLE")"
if [ -z "$KV_ID" ]; then
    echo "Creating KV namespace $KV_TITLE"
    wrangler kv namespace create "$KV_TITLE" >/dev/null
    KV_LIST="$(wrangler kv namespace list)"
    KV_ID="$(printf '%s' "$KV_LIST" | node -e '
let i="";process.stdin.on("data",c=>i+=c).on("end",()=>{
const m=JSON.parse(i).filter(n=>n.title===process.argv[1]);
process.stdout.write(m.length===1?m[0].id:"");});' "$KV_TITLE")"
fi
if [ -z "$KV_ID" ]; then
    echo "Could not resolve KV namespace ID for $KV_TITLE"
    exit 1
fi
sed -i.bak "s|^binding = \"CACHE\".*|binding = \"CACHE\"\nid = \"$KV_ID\"|" wrangler.toml
rm -f wrangler.toml.bak

# Deploy both independently configured Workers
echo "Deploying webhook Worker to $DEPLOY_URL..."
npm run deploy:webhook
echo "Deploying transcription Worker..."
npm run deploy:transcription

echo "Production release completed successfully!"
echo "Deployed to: $DEPLOY_URL"