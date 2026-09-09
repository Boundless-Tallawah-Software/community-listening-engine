#!/usr/bin/env bash
# create_cloudflare_resources.sh
# This script will create the Cloudflare resources needed by the Community Listening Engine.
# It uses wrangler CLI. Ensure you are authenticated with:
#   wrangler login or set CLOUDFLARE_ACCOUNT_ID & CLOUDFLARE_API_TOKEN.

set -euo pipefail

ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID:?"CLOUDFLARE_ACCOUNT_ID not set"}
WRANGLER_CMD=${WRANGLER_CMD:-wrangler}

# Helper to check if a resource exists.
# Returns 0 if exists, 1 otherwise.
exists() {
  local type="$1"
  local name="$2"
  case "$type" in
    d1)
      $WRANGLER_CMD d1 show $name >/dev/null 2>&1
      return $?;
      ;;
    r2)
      $WRANGLER_CMD r2 ls $name >/dev/null 2>&1
      return $?;
      ;;
    kv)
      $WRANGLER_CMD kv:namespace list | grep -Fq "$name"
      return $?;
      ;;
    queue)
      $WRANGLER_CMD queue list | grep -Fq "$name"
      return $?;
      ;;
    *)
      echo "Unsupported type: $type"
      return 1;
      ;;
  esac
}

# Create D1 database
if ! exists d1 listen_engine_db; then
  echo "Creating D1 database: listen_engine_db"
  $WRANGLER_CMD d1 create listen_engine_db
else
  echo "D1 database already exists"
fi

# Create R2 bucket
if ! exists r2 listen-audio; then
  echo "Creating R2 bucket: listen-audio"
  $WRANGLER_CMD r2 create listen-audio
else
  echo "R2 bucket already exists"
fi

# Create KV namespace
if ! exists kv CACHE; then
  echo "Creating KV namespace CACHE"
  $WRANGLER_CMD kv:namespace create --binding CACHE "Cache for community listening"
else
  echo "KV namespace CACHE already exists"
fi

# Create Queue
if ! exists queue transcription; then
  echo "Creating Queue: transcription"
  $WRANGLER_CMD queue create transcription
else
  echo "Queue transcription already exists"
fi

echo "All resources verified/created"
