#!/usr/bin/env bash
set -euo pipefail
ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID:?}
WRANGLER=wrangler

# D1 database
if ! $WRANGLER d1 show listen_engine_db --account-id "$ACCOUNT_ID" > /dev/null 2>&1; then
  echo "Creating D1 database: listen_engine_db"
  $WRANGLER d1 create listen_engine_db || true
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

echo "All resources verified/created"

