#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DEPLOY_TARGET="${DEPLOY_TARGET:-production}"
case "$DEPLOY_TARGET" in
  production) DATABASE_NAME="listen_engine_db" ;;
  staging) DATABASE_NAME="listen_engine_db_staging" ;;
  *) echo "DEPLOY_TARGET must be production or staging." >&2; exit 1 ;;
esac
WRANGLER_CONFIG="${WRANGLER_CONFIG:-wrangler.transcription.toml}"
TEMP_FILE="$(mktemp)"
trap 'rm -f "$TEMP_FILE"' EXIT

: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"

run_wrangler() {
  if [[ -n "${WRANGLER_ENV:-}" ]]; then
    wrangler "$@" --config "$WRANGLER_CONFIG" --env "$WRANGLER_ENV"
  else
    wrangler "$@" --config "$WRANGLER_CONFIG"
  fi
}

printf 'Checking for partial D1 schema changes...\n'
run_wrangler d1 execute "$DATABASE_NAME" \
  --remote \
  --yes \
  --json \
  --command "$(cat scripts/check_d1_schema.sql)" > "$TEMP_FILE"

MIGRATION_SCHEMA_RESULT="$(cat "$TEMP_FILE")" node -e '
  const response = JSON.parse(process.env.MIGRATION_SCHEMA_RESULT);
  const result = Array.isArray(response) ? response[0]?.results?.[0] : response?.results?.[0];
  if (!result || Number(result.has_partial_schema) !== 0) {
    console.error("D1 contains a partially-applied or incompatible schema migration; refusing to baseline or apply migrations.");
    process.exit(1);
  }
'

printf 'Reconciling existing D1 schema with Wrangler migration history...\n'
run_wrangler d1 execute "$DATABASE_NAME" \
  --remote \
  --yes \
  --file scripts/baseline_d1_migrations.sql

printf '\nChecking pending D1 migrations...\n'
run_wrangler d1 migrations list "$DATABASE_NAME" \
  --remote

printf '\nApplying pending D1 migrations...\n'
run_wrangler d1 migrations apply "$DATABASE_NAME" \
  --remote
