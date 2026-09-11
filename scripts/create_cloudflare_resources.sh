#!/usr/bin/env bash
set -euo pipefail
ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID:?}
WRANGLER=wrangler

exists() {
  local type="$1" name="$2"
  case "$type" in
    d1)
      $WRANGLER d1 show "$name" --account-id "$ACCOUNT_ID" > /dev/null 2>&1 ;;
    r2)
      $WRANGLER r2 ls "$name" > /dev/null 2>&1 ;;
    kv)
      $WRANGLER kv:namespace list | grep -Fq "$name" > /dev/null ;;
    queue)
      $WRANGLER queues list | grep -Fq "$name" > /dev/null ;;
    *)
      return 1 ;;
  esac
  return $?
}

# D1 database
if ! exists d1 listen_engine_db; then
  echo "Creating D1 database: listen_engine_db"
  $WRANGLER d1 create listen_engine_db || true
else
  echo "D1 database already exists"
fi

# R2 bucket
if ! exists r2 listen-audio; then
  echo "Creating R2 bucket: listen-audio"
  $WRANGLER r2 bucket create listen-audio || true
else
  echo "R2 bucket already exists"
fi

# KV namespace
if ! exists kv CACHE; then
  echo "Creating KV namespace CACHE"
  $WRANGLER kv:namespace create CACHE || true
else
  echo "KV namespace CACHE already exists"
fi

# Queue
if ! exists queue transcription; then
  echo "Creating Queue transcription"
  $WRANGLER queues create transcription || true
else
  echo "Queue transcription already exists"
fi

echo "All resources verified/created"
