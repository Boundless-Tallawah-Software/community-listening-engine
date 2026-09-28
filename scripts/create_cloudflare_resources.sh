#!/usr/bin/env bash
set -euo pipefail
ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID:?}
WRANGLER=wrangler
DEPLOY_TARGET="${DEPLOY_TARGET:-production}"

case "$DEPLOY_TARGET" in
  production) DATABASE_NAME="listen_engine_db" ;;
  staging) DATABASE_NAME="listen_engine_db_staging" ;;
  *) echo "DEPLOY_TARGET must be production or staging." >&2; exit 1 ;;
esac

# D1 database
if ! $WRANGLER d1 info "$DATABASE_NAME" --account-id "$ACCOUNT_ID" > /dev/null 2>&1; then
  echo "Creating D1 database: $DATABASE_NAME"
  $WRANGLER d1 create "$DATABASE_NAME" --account-id "$ACCOUNT_ID" || true
fi

D1_DATABASE_ID="$($WRANGLER d1 list --json --account-id "$ACCOUNT_ID" | node scripts/resolve_d1_database_id.mjs "$DATABASE_NAME")"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  printf 'd1_database_id=%s\n' "$D1_DATABASE_ID" >> "$GITHUB_OUTPUT"
else
  printf 'CLOUDFLARE_D1_DATABASE_ID=%s\n' "$D1_DATABASE_ID"
fi

if [[ "${D1_ONLY:-false}" == "true" ]]; then
  exit 0
fi

# R2 bucket
$WRANGLER r2 bucket create listen-audio || true

# KV namespace
# KV namespace
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

