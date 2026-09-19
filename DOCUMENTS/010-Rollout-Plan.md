# Cloudflare Deployment Plan – Staging to Production

## Objective
Deploy the Community Listening Engine on Cloudflare’s serverless platform, migrating all backend logic to Workers, the database to D1, audio storage to R2, and the frontend to Cloudflare Pages. This plan covers environment setup, code migration, data transfer, and rollout strategies.

## Prerequisites
- **Cloudflare account** with API token (permissions: `Account Workers Edit`, `Workers AI`, `D1`, `R2`, `KV`, `Queues`, `Pages`).
- **Wrangler CLI** v3 installed globally (`npm i -g wrangler`).
- Existing project repository with Docker, FastAPI, SQLite schema, and static assets.
- Local development environment with Node.js >= 18.x.

## 1. Project Scaffolding
| Step | Command | Purpose |
|------|---------|----------|
| 1 | `wrangler init community-listening` | Create a new Cloudflare project with a blank worker and pages subproject. |
| 2 | Add pages subproject: `wrangler pages add frontend` | Scaffold Pages config. |
| 3 | Configure bindings in `wrangler.toml` → [see below](#bindings). |

## 2. Binding Configuration (`wrangler.toml`)
```toml
name = "community-listening"
workers_dev = false
compatibility_date = "2026-09-15"

[account]
id = "<ACCOUNT_ID>"

[ai]
binding = "AI"

[[d1_databases]]
binding = "DB"
database_name = "community_listening"
database_id = "<D1_ID>"

[[r2_buckets]]
binding = "R2"
bucket_name = "whatsapp-audio"

[[kv_namespaces]]
binding = "CACHE"
# id will be injected automatically by wrangler

[[queue_producers]]
binding = "JOBS"
queue = "transcription"

[logpush]
# Enable structured logging to Workers Tracing
binding = "LOG"

[triggers]
# Optional: set a route for Workers
route = "*://*.example.com/*"  # replace with production domain
```

## 3. Backend Migration
### 3.1. API Layer
- Convert `api/main.py` into TypeScript `src/worker.ts`.
- Preserve routes: `/health`, `/prospects`, `/webhooks/whatsapp`. Each handler will return a `Response`.
- Use `await env.DB.prepare(...).run()` for queries.
- Replace local SQLite access with `env.D1` methods.
- Use `env.VALIDATE_EMAIL` (optional email validation) if needed.

### 3.2. Workers AI
- Replace Whisper/Ollama calls with `env.AI.run("@cf/openai/whisper-large-v3-turbo", { audio: [...], language: "en" })`.
- Replace LLM calls with `env.AI.run("@cf/mistral-small-3.1-24b-instruct", { messages: [...] })`.
- Cache results in KV (`env.CACHE`) with 5‑min TTL.

### 3.3. Queue Worker
- Create `src/queue-transcription.ts` to consume jobs.
- Receive JSON payload via `request.json()`.
- Pull audio from `env.R2.get(key)`.
- Process with Workers AI functions.
- Persist insights in D1.

### 3.4. Utility Functions
- Implement `src/utils/kvcache.ts` for `setWithTTL` and `getWithTTL`.
- Add `src/utils/validators.ts` if needed.

## 4. Database Migration
1. Extract schema from `core/database_manager.py` and convert to D1-compatible SQL.
2. Create migration script `migrations/01_migrate_schema.sql`.
3. Add a `db-migrate` script in `package.json`:
   ```json
   "scripts": {
     "db-migrate": "wrangler d1 execute DB --file migrations/01_migrate_schema.sql"
   }
   ```
4. Run locally against a temporary D1 DB, then run on Cloudflare:
   `wrangler d1 execute DB --file migrations/01_migrate_schema.sql`.
5. Migrate data:
   ```bash
   sqlite3 data/your.db .dump > dump.sql
   # Clean up table names and replace foreign keys
   # Pipe into D1:
   wrangler d1 execute DB --file dump.sql
   ```

## 5. Audio Storage (R2)
- Upload any existing audio files into the R2 bucket via the AWS‑S3 CLI (`aws s3 sync ./data/audio s3://whatsapp-audio`).
- Update webhook handling to write to `env.R2.put`.
- Configure CORS policies if needed.

## 6. Frontend Deployment (Pages)
1. Move static assets to `frontend/` directory.
2. Add a build script to `package.json`:
   ```json
   "scripts": {"build": "npm run build:pages"}
   ```
3. Configure `wrangler.toml` for Pages:
   ```toml
   [pages]
   name = "frontend"
   project = "frontend"
   script = "build"
   build = "npm run build"
   publish = "dist"
   ```
4. Deploy preview: `wrangler pages deploy frontend`.
5. Verify routing and SSL.

## 7. Observability & Alerts
- Enable Workers Tracing in `wrangler.toml` with `trace={}`.
- Configure structured log format (JSON) and route logs to Slack via event‑router.
- Set up a notification job in Worker that checks for 5xx responses and posts to a webhook.

## 8. Rollout Strategy
| Phase | Duration | Description |
|-------|----------|-------------|
| 1 – Canary | 1‑2 days | Deploy Workers to a preview URL; monitor latency & errors. |
| 2 – Staging | 3 days | Point a staging sub‑domain to the preview; run user acceptance tests. |
| 3 – Production | 1 day | Switch DNS to Workers and Pages; shut down Docker containers. |

## 9. Rollback Plan
- Keep the Docker Compose deployment running until Workers are fully tested.
- Maintain a `docker-compose.override.yml` with a `--build` flag for quick local testing.
- Use `wrangler tail` to monitor logs and rollback to previous worker version if critical issue detected.

## Deliverables
- `wrangler.toml` with all bindings.
- `src/worker.ts`, `src/queue-transcription.ts`, `src/utils/…`.
- D1 migration scripts.
- Page build files in `frontend/`.
- CI pipeline updates for deployment.
- Monitoring artifacts (Slack webhook, log push config).

---
**Next Steps:**
1. Create Cloudflare Project ID.
2. Generate Wrangler API token.
3. Scaffold worker and pages.
4. Start code migration.
5. Commit and push for CI.

**Prepared by:** Dev Agent
