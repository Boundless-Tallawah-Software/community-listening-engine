# MIGRATION ROADMAP

_Implementation plan for migrating the Community Listening Engine from the existing Docker/Python stack to a Cloudflare Workers AI architecture.  The roadmap is drafted for a **single‑person developer** team with agent assistance and is scoped to the current branch `cloudflare-arch-implementation`.

## 1️⃣ Overview

- **Goal:** Deploy a serverless stack (Workers + Workers AI + R2 + D1 + KV + Queues) that fully replaces the Docker‑based service.
- **Owner:** Dev (you) with agent support.
- **Timeline:** 8‑week sprint (5‑day weeks, full‑time).
- **Success Criteria:** 100% functional end‑to‑end pipeline, zero downtime at cut‑over, costs stay within free tier.

## 2️⃣ Success Criteria

1. Fully functioning Worker handling WhatsApp webhooks, transcription, and insight extraction.
2. No data loss during migration.
3. Continuous testing coverage ≥ 80 %.
4. Updated documentation in repo and Obsidian vault.

## 3️⃣  Week‑by‑Week Plan

| Week | Focus | Key Tasks | Deliverable |
|------|-------|-----------|--------------|
| **0 – Prep** | Scope & tooling | 1. Review repo. 2. Install Wrangler. 3. Init Cloudflare project. 4. Set up Wrangler config. | Dev environment ready |
| **1** | Environment | Create R2, D1, KV, Queue. Write `wrangler.toml`. | Dev environment configured |
| **2** | Transcription | Implement `transcribe_audio` with `@cf/openai/whisper`. Add tests. | Worker transcribes audio |
| **3** | Insights | Implement `extract_insights` with `@cf/mistral-small‑3.1‑24b‑instruct`. Add tests. | Worker extracts insights |
| **4** | Queue & R2 | Wire audio to R2, enqueue jobs. | Async pipeline functional |
| **5** | Persistence | Migrate DBManager to D1. | Data stored in D1 |
| **6** | WhatsApp Integration | Rewrite webhook handler in Worker. | Production‑ready webhook |
| **7** | QA | End‑to‑end integration tests, load tests. | Robust test suite |
| **8** | Cut‑over | Switch traffic, archive Docker, update docs. | Live Worker |

## 4️⃣ Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|------------|
| Rate limits | Medium | Queue, back‑off, batching |
| Data loss | High | Migrate scripts + rollback |
| Cost overruns | Low | Monitor free tier thresholds |
| Agent bugs | Medium | Unit tests + code review |

## 5️⃣ Tracking & Communication

- *GitHub issues*: Create `migration-roadmap` issue to track progress.
- *Stand‑ups*: Log updates in PLANS/ or Obsidian notes.

---

*The file is updated in branch `cloudflare-arch-implementation`.*