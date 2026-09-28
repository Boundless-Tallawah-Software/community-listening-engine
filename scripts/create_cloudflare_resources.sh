#!/usr/bin/env bash
set -euo pipefail
ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID:?}
WRANGLER=wrangler

# D1 database
if ! $WRANGLER d1 info listen_engine_db --account-id "$ACCOUNT_ID" > /dev/null 2>&1; then
  echo "Creating D1 database: listen_engine_db"
  $WRANGLER d1 create listen_engine_db --account-id "$ACCOUNT_ID" || true
fi

D1_DATABASE_ID="$($WRANGLER d1 list --json --account-id "$ACCOUNT_ID" | node scripts/resolve_d1_database_id.mjs listen_engine_db)"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  printf 'd1_database_id=%s\n' "$D1_DATABASE_ID" >> "$GITHUB_OUTPUT"
else
  printf 'CLOUDFLARE_D1_DATABASE_ID=%s\n' "$D1_DATABASE_ID"
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

