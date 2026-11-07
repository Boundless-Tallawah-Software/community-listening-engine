# AGENTS.md - Community Listening Engine

## Project Overview

Community Listening Engine is a Cloudflare-native application for collecting community feedback, processing WhatsApp voice messages, and presenting prospect, message, and insight data.

The active runtime is:

- Cloudflare Pages for the static frontend.
- Cloudflare Pages Functions for prospect and dashboard APIs.
- Cloudflare Workers for WhatsApp webhooks and audio processing.
- Cloudflare Queues for asynchronous transcription.
- Workers AI for transcription and insight extraction.
- D1 for structured data and R2 for audio objects.

The Python/FastAPI code under `api/` and `core/`, plus Docker configuration, is legacy. Treat it as reference or compatibility code unless a task explicitly targets it.

## Source of Truth

When files conflict, prefer:

1. `package.json` and `scripts/` for commands and build behavior.
2. `.github/workflows/ci.yml` and `.github/workflows/preview.yml` for CI/CD behavior.
3. `wrangler.toml` and `wrangler.transcription.toml` for runtime bindings and entry points.
4. `src/README-cloudflare.md` for Worker architecture.
5. `README-cloudflare.md` for Pages deployment.
6. `DOCUMENTS/` for plans and operational context.

The root `README.md` contains stale legacy commands and architecture. Verify commands against `package.json` before using them.

## Repository Map

```text
src/                  Active Workers, AI services, shared types/utilities
functions/api/        Cloudflare Pages Functions and shared API helpers
web/                  Static Pages frontend (HTML, CSS, browser JavaScript)
migrations/           Ordered D1/SQLite migrations
scripts/              Build, migration, resource, and deployment scripts
tests/                Active Node tests and legacy pytest tests
api/, core/           Legacy FastAPI/Python implementation
models/, data/        Legacy Python package/data assets
DOCUMENTS/            Architecture, deployment, testing, and plan documents
```

## Component Boundaries

### Frontend

- `web/` is framework-free HTML, CSS, and browser JavaScript; do not introduce a frontend framework unless explicitly requested.
- `scripts/build_pages.mjs` assembles `dist/`, copies CSS to `dist/static/css/`, copies `web/prospect/app.js` to `dist/static/app.js`, and writes `dist/_redirects`.
- Frontend API calls use same-origin routes.
- The dashboard behavior used by the Pages build is in `api/static/js/dashboard.js`; treat `web/app.js` as stale unless deliberately synchronized.
- Keep `web/prospect/app.js` and `web/prospect/index.html` aligned when changing prospect behavior.

### Pages Functions

- `functions/api/` contains the public and dashboard APIs.
- `functions/api/_shared.js` contains shared response, validation, and D1 helpers.
- Export the appropriate `onRequestGet`, `onRequestPost`, or other Pages Function handler.
- Return sanitized errors; never leak stack traces or database details.

### Workers and Queues

- `src/webhook-worker.ts` is the webhook Worker entry point.
- `src/queue-producer.ts` publishes transcription work.
- `src/queue-transcription.ts` consumes messages, calls Workers AI, and persists results idempotently to D1.
- `src/worker-transcription.ts` and `src/worker-intelligence.ts` isolate model-specific behavior.
- Keep queue processing idempotent. Do not acknowledge a message before required persistence succeeds.
- Key transcript and insight upserts by a stable `audio_key`.
- `src/consumer.ts` and `src/whatsapp-webhook.ts` are not configured Worker entry points; do not treat them as active entry points.

### D1 and Migrations

- Add a new numerically prefixed migration; do not rewrite an already-deployed migration.
- Use idempotent writes for retryable processing.
- Validate migrations against a database that may already contain earlier schema changes.
- Run `bash scripts/migrate_d1.sh` only against the intended environment.

### Legacy Python

- `api/main.py`, `api/webhooks.py`, `core/database_manager.py`, `core/transcription_service.py`, and `core/intelligence_service.py` implement the legacy stack.
- Docker files and `docker-compose.yml` configure that legacy stack.
- Do not modify or present this stack as the current production path unless explicitly requested.

## Commands

Install dependencies:

```bash
npm ci
```

Run active Node/Cloudflare tests:

```bash
npm test
```

This directly runs `tests/worker.test.ts`, `tests/queue-transcription.test.ts`, and `tests/pages-functions.test.js`. It does not run Jest or pytest.

Build Workers with dry-run Wrangler deployments:

```bash
npm run build
```

Build the static Pages site into `dist/`:

```bash
npm run build:pages
```

Type-check when changing TypeScript:

```bash
npx tsc --noEmit
```

`npm run lint` is currently a placeholder that prints `Linting skipped`; do not describe it as an enforced lint check. There is no configured local development script.

Run legacy Python tests only when changing the Python implementation:

```bash
pytest tests/ -vv
```

## Change Workflow

1. Before modifying files, check the current branch. If it is the repository's default branch, create a descriptive new branch from it before making changes.
2. Commit all resulting changes on that new branch; never commit task changes directly to the default branch unless the user explicitly requests it.
3. Identify whether the task targets the active Cloudflare stack, the legacy Python stack, or shared frontend assets.
4. Read the nearest authoritative source and configuration.
5. Make the smallest focused change within the relevant component boundary.
6. Add or update tests with behavior changes.
7. Run the relevant verification commands.
8. Update documentation under `DOCUMENTS/` when architecture, commands, APIs, deployment, or operational behavior changes.

Minimum verification for active Cloudflare changes:

```bash
npm test
npm run build
npm run build:pages
```

Also run `npx tsc --noEmit` for TypeScript changes.

Update the corresponding test when changing:

- Worker behavior: `tests/worker.test.ts`
- Queue behavior: `tests/queue-transcription.test.ts`
- Pages API behavior: `tests/pages-functions.test.js`

## Conventions and Safety

- The root package is ESM (`"type": "module"`).
- Avoid Node-only APIs in Worker and Pages Function code.
- Keep frontend and API response contracts aligned.
- Escape user-controlled or database-provided values before rendering them.
- Never commit credentials, tokens, production data, database IDs, or namespace IDs.
- Require human review for production deployments, destructive D1 changes, access-policy changes, and domain/route changes.
- When asked to branch and commit, inspect `git status` and the diff, create a descriptive branch, stage only intended files, and use a focused commit message.

## Known Pitfalls

- The root `README.md`, `jest.config.js`, and some npm dependencies are legacy.
- `tests/whatsapp-webhook.test.ts` uses Vitest, but Vitest is not installed and this file is not in `npm test`.
- The D1 migration reconciler covers migrations `00` through `03`, but not `04_create_prospects.sql` or `05_add_business_name_to_prospects.sql`; verify the `prospects` table against partially migrated databases.
- Staging hostnames differ between documentation and scripts (`stage-cle` versus `stage-ask`).
- `DOCUMENTS/016-Deployment-Configuration.md` describes a manual `target=staging` workflow input that the production workflow does not define.
- The webhook Worker acknowledges text payloads without persisting them to the message tables consumed by the dashboard.
- `scripts/README.md` documents only part of the current deployment-script surface.

Do not silently fix unrelated inconsistencies during feature work. Flag them and keep changes focused.

## Documentation

- Put new Markdown documents under `DOCUMENTS/`.
- Use numeric prefixes and capitalized, dash-separated names, for example `018-Example-Title.md`.
- Link to authoritative source files rather than duplicating their contents.
- Prefer `README-cloudflare.md`, `src/README-cloudflare.md`, and `DOCUMENTS/016-Deployment-Configuration.md` for current deployment context.
- Treat other `DOCUMENTS/` files as plans or historical records unless confirmed otherwise.
