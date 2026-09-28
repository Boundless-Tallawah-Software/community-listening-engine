#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

: "${CLOUDFLARE_PAGES_PROJECT_NAME:?CLOUDFLARE_PAGES_PROJECT_NAME is required}"
: "${CLOUDFLARE_D1_DATABASE_ID:?CLOUDFLARE_D1_DATABASE_ID is required}"

CONFIG_FILE="$ROOT_DIR/.wrangler.pages.generated.jsonc"
trap 'rm -f "$CONFIG_FILE"' EXIT

npm run build:pages
node scripts/create_pages_config.mjs "$CONFIG_FILE"
wrangler pages deploy dist \
  --config "$CONFIG_FILE" \
  --project-name "$CLOUDFLARE_PAGES_PROJECT_NAME" \
  --branch main