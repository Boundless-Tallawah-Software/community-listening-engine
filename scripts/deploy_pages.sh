#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

: "${CLOUDFLARE_PAGES_PROJECT_NAME:?CLOUDFLARE_PAGES_PROJECT_NAME is required}"
: "${CLOUDFLARE_D1_DATABASE_ID:?CLOUDFLARE_D1_DATABASE_ID is required}"
: "${CLOUDFLARE_D1_PREVIEW_DATABASE_ID:?CLOUDFLARE_D1_PREVIEW_DATABASE_ID is required}"

PAGES_PROJECT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/community-listening-pages.XXXXXX")"
trap 'rm -rf "$PAGES_PROJECT_DIR"' EXIT

npm run build:pages
cp -R dist functions "$PAGES_PROJECT_DIR/"
node scripts/create_pages_config.mjs "$PAGES_PROJECT_DIR/wrangler.jsonc"
wrangler pages deploy dist \
  --cwd "$PAGES_PROJECT_DIR" \
  --project-name "$CLOUDFLARE_PAGES_PROJECT_NAME" \
  --branch main