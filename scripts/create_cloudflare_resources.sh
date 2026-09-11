#!/usr/bin/env bash
set -euo pipefail
ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID:?}
WRANGLER=wrangler

# D1 database
if ! $WRANGLER d1 show listen_engine_db --account-id "$ACCOUNT_ID" > /dev/null 2>&1; then
  echo "Creating D1 database: listen_engine_db"
  $WRANGLER d1 create listen_engine_db || true
else
  echo "D1 database already exists"
fi

# R2 bucket
if ! $WRANGLER r2 list | grep -Fq "listen-audio" > /dev/null 2>&1; then
  echo "Creating R2 bucket: listen-audio"
  $WRANGLER r2 bucket create listen-audio || true
else
  echo "R2 bucket already exists"
fi

# KV namespace
if ! $WRANGLER kv:namespace list | grep -Fq "CACHE" > /dev/null 2>&1; then
  echo "Creating KV namespace CACHE"
  $WRANGLER kv:namespace create CACHE || true
else
  echo "KV namespace CACHE already exists"
fi

# Queue
if ! $WRANGLER queues list | grep -Fq "transcription" > /dev/null 2>&1; then
  echo "Creating Queue transcription"
  $WRANGLER queues create transcription || true
else
  echo "Queue transcription already exists"
fi

echo "All resources verified/created"
