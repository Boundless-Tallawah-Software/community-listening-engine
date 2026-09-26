#!/bin/bash

# URL configuration script for Community Listening Engine
# Sets the correct route URL based on environment

set -e  # Exit on any error

echo "Configuring deployment URL..."

# Set environment variables based on deployment target
if [ "$1" = "production" ]; then
    echo "Setting production URL"
    ROUTE_PATTERN="ask.boundless-tallawah.com"
elif [ "$1" = "staging" ]; then
    echo "Setting staging URL"
    ROUTE_PATTERN="stage-ask.boundless-tallawah.com"
else
    echo "Usage: $0 {production|staging}"
    exit 1
fi

# Check if wrangler.toml exists
if [ ! -f "wrangler.toml" ]; then
    echo "Error: wrangler.toml not found in project root"
    exit 1
fi

# Update the route pattern in wrangler.toml
sed -i.bak "s/pattern = \".*\"/pattern = \"$ROUTE_PATTERN\"/" wrangler.toml

echo "URL configured successfully for $1 environment"
echo "Route pattern set to: $ROUTE_PATTERN"

# Clean up backup file
rm -f wrangler.toml.bak