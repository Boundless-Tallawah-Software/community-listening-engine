# Deployment Scripts

This directory contains scripts to help with production deployments.

## Scripts

### `deploy.sh`
Main deployment script that builds and deploys the application to Cloudflare Workers.

Usage:
```bash
./deploy.sh production    # Deploy to production
./deploy.sh staging       # Deploy to staging
```

### `config-url.sh`
Configures the correct route URL in wrangler.toml for the target environment.

Usage:
```bash
./config-url.sh production   # Set URL for production
./config-url.sh staging      # Set URL for staging
```

## Deployment Process

1. Ensure you have installed wrangler CLI: `npm install -g wrangler`
2. Configure your Cloudflare credentials with: `wrangler login`
3. Run the appropriate deployment script:
   - For staging: `./deploy.sh staging`
   - For production: `./deploy.sh production`