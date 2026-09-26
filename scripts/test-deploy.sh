#!/bin/bash

# Simple test to verify the deployment scripts work correctly

echo "Testing deployment scripts..."

# Test 1: Check that deploy.sh exists and is executable
if [ -x "./deploy.sh" ]; then
    echo "✓ deploy.sh is executable"
else
    echo "✗ deploy.sh is not executable or doesn't exist"
    exit 1
fi

# Test 2: Check that config-url.sh exists and is executable
if [ -x "./config-url.sh" ]; then
    echo "✓ config-url.sh is executable"
else
    echo "✗ config-url.sh is not executable or doesn't exist"
    exit 1
fi

# Test 3: Validate wrangler.toml exists
if [ -f "wrangler.toml" ]; then
    echo "✓ wrangler.toml exists"
else
    echo "✗ wrangler.toml does not exist"
    exit 1
fi

echo "All tests passed!"
echo "Usage:"
echo "  ./deploy.sh production     # Deploy to production"
echo "  ./deploy.sh staging        # Deploy to staging"
echo "  ./config-url.sh production # Configure URL for production"
echo "  ./config-url.sh staging    # Configure URL for staging"