# 000-Cloudflare-Greenfield-Implementation

*This file provides a concise implementation outline for migrating the Community Listening Engine to a serverless Cloudflare stack.  It references the greenfield roadmap (see `CLOUDFLARE_GREENFIELD_ROADMAP.md`) and expands key technical steps for setup, deployment, CI, and monitoring.*

## High‑level Stack
- **Workers / Workers AI** – serverless runtime + LLM inference (Whisper, Mistral, etc.)
- **R2** – object store for raw audio files
- **D1** – serverless SQL database for metadata & insights
- **KV** – short‑lived cache for recent results
- **Queues** – asynchronous job processing (transcription → insight)
- **Pages** – static front‑end dashboard
- **Durable Objects** – optional real‑time state (e.g., chat or live analytics)

## Project Structure
```
community_listening_engine/
├─ api/                       # FastAPI/Python REST layer (if needed)
├─ core/                      # Business logic, Workers entrypoints
│  ├─ webhook-worker.ts
│  ├─ worker-transcription.ts
│  ├─ worker-intelligence.ts
│  └─ types.ts
├─ pages/                      # Cloudflare Pages site
├─ .github/workflows/ci.yml    # GitHub Actions CI/CD
├─ wrangler.toml               # Binding declarations
├─ migrations/
│  └─ 00_create_tables.sql
├─ src/                        # TypeScript/TS‑Node code (optional)
└─ DOCUMENTS/
   └─ 000-Cloudflare-Greenfield-Implementation.md
```

## Implementation Steps
1. **Wrangler & Bindings** – Set up `wrangler.toml` with AI, D1, R2, KV, and Queue bindings.
2. **Resources** – Run Cloudflare CLI to create bucket, database, namespace, queue.
3. **Schema** – Load `migrations/00_create_tables.sql` into D1 during CI.
4. **Workers** – Implement handlers per the roadmap.
5. **Testing** – Write Jest/TS unit tests with mocks; integration tests against `wrangler dev`.
6. **CI** – GitHub Actions pipeline (lint → test → preview → publish).
7. **Observability** – Enable Workers tracing, structured logs, and monitoring alerts.
8. **Deploy** – `wrangler publish` to main; preview branch for PRs.

## CI Pipeline (cf. `.github/workflows/ci.yml`)
```yaml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
  test:
    runs-on: ubuntu-latest
    needs: lint
    env:
      CF_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}
      CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test
      - run: npm run build
  preview:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - name: Publish preview
        env: { CF_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}, CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }} }
        run: wrangler preview
  deploy:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - name: Publish
        env: { CF_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}, CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }} }
        run: wrangler publish
```

## Monitoring & Alerts
- Cloudflare dashboard for Workers metrics.
- Billing alerts for AI usage.
- Cloudflare Workers logs filtered by `metadata.service`.
- Optional Slack / PagerDuty integration via Cloudflare Event Router.

---
**Next Steps**
- Commit this file.
- Create any missing directories (`core/`, `pages/`, etc.).
- Run `wrangler dev` locally for early validation.
- Push to GitHub; verify CI workflow runs successfully.
