# Deployment Configuration

This document explains how to deploy the Community Listening Engine to different environments with distinct domains.

## Environments and Domains

### Production
- Domain: `ask.boundless-tallawah.com`
- Deployment target: default (no target parameter)
- Command: `gh workflow run ci.yml -r main`

### Staging
- Domain: `stage-cle.boundless-tallawah.com`
- Deployment target: `target=staging`
- Command: `gh workflow run ci.yml -r main -p target=staging`

## How It Works

The deployment configuration is managed through:
1. `wrangler.toml` - Defines the default route for production
2. GitHub Actions workflow (`ci.yml`) - Handles environment-specific deployment based on target parameter
3. Domain setup in Cloudflare - Required for SSL certificates and DNS records

## D1 Migrations

The main-branch deploy job runs `bash scripts/migrate_d1.sh` before deploying either Worker. The script reconciles known legacy schema with Wrangler's `d1_migrations` history, lists pending migration files, and applies only those not recorded as applied. Wrangler creates a D1 backup before applying migrations in CI.

Legacy migration names are recorded only when the corresponding schema is present. Fresh databases receive no baseline records and have all migrations applied. A preflight rejects partial schema changes before Wrangler applies anything, stopping deployment so the schema can be repaired and retried. Production deploys are serialized to prevent concurrent migration races. The Cloudflare API token must have D1 write access for this step.

## Manual Deployment

To deploy manually to staging environment:
```bash
gh workflow run ci.yml -r main -p target=staging
```

For production deployment (default):
```bash
gh workflow run ci.yml -r main
```

## Configuration Notes

The `wrangler.toml` file is set up with the production domain as default. The staging domain will be applied through environment variables or parameters during the CI process.