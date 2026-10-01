#!/usr/bin/env bash
set -euo pipefail
# Require the target account; Wrangler reads this value from the environment.
: "${CLOUDFLARE_ACCOUNT_ID:?}"
WRANGLER=wrangler
DEPLOY_TARGET="${DEPLOY_TARGET:-production}"

case "$DEPLOY_TARGET" in
  production) DATABASE_NAME="listen_engine_db" ;;
  staging) DATABASE_NAME="listen_engine_db_staging" ;;
  *) echo "DEPLOY_TARGET must be production or staging." >&2; exit 1 ;;
esac

# D1 database
if ! $WRANGLER d1 info "$DATABASE_NAME" > /dev/null 2>&1; then
  echo "Creating D1 database: $DATABASE_NAME"
  $WRANGLER d1 create "$DATABASE_NAME"
fi

D1_DATABASE_ID="$($WRANGLER d1 list --json | node scripts/resolve_d1_database_id.mjs "$DATABASE_NAME")"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  printf 'd1_database_id=%s\n' "$D1_DATABASE_ID" >> "$GITHUB_OUTPUT"
else
  printf 'CLOUDFLARE_D1_DATABASE_ID=%s\n' "$D1_DATABASE_ID"
fi

# Pages project (idempotent; needed before any `wrangler pages deploy`/`functions build`)
if [[ -n "${CLOUDFLARE_PAGES_PROJECT_NAME:-}" ]]; then
  if ! $WRANGLER pages project list 2>/dev/null | grep -Fq "$CLOUDFLARE_PAGES_PROJECT_NAME"; then
    echo "Creating Pages project: $CLOUDFLARE_PAGES_PROJECT_NAME"
    $WRANGLER pages project create "$CLOUDFLARE_PAGES_PROJECT_NAME" --production-branch main
  fi
fi

if [[ "${D1_ONLY:-false}" == "true" ]]; then
  exit 0
fi

# R2 bucket
$WRANGLER r2 bucket create listen-audio || true

# KV namespace
$WRANGLER kv namespace create CACHE || true

# Queue
if ! $WRANGLER queues list | grep -Fq "transcription" > /dev/null 2>&1; then
  echo "Creating Queue transcription"
  $WRANGLER queues create transcription || true
fi

if ! $WRANGLER queues list | grep -Fq "transcription-dlq" > /dev/null 2>&1; then
  echo "Creating Queue transcription-dlq"
  $WRANGLER queues create transcription-dlq || true
fi

echo "All resources verified/created"

