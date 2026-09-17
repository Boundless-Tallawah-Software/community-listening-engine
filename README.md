# Community Listening Engine

A conversation‑to‑client system designed to book, guide, and capture workflow conversations with business owners.

> **NOTE**:  The repository has moved from the original Python/FastAPI stack to a Node/TypeScript implementation.
> The README has been completely rewritten to match the current codebase.

---

## Quick start

```bash
# Clone the repository
git clone <repository‑url>
cd community_listening_engine

# Create the .env file (copy example)
cp .env.example .env

# Install dependencies (Node 20+ required)
npm install

# Build the client & server assets
npm run build

# Launch the services
docker compose up -d

# Verify everything is healthy
curl http://localhost:8880/health
```

> The backend runs on **Node 20**.
> Docker Compose pulls the official `node:20-alpine` image for the services.

### Port diagram

| Service | Host Port | Description |
|---------|-----------|-------------|
| api      | 8880 | Node Express API + HTTP webhook endpoints |
| worker   | 8890 | Background worker (queue consumer) |
| static   | 80   | HTTP static files (only for production builds) |

---

## Project Structure

```
community_listening_engine/
├── src/                     # TypeScript source code (backend + workers)
│   ├── api/                 # Express API (routes, middleware, handlers)
│   ├── workers/             # Background workers (transcription, intelligence)
│   ├── utils/               # Shared utilities, types, config
│   └── index.ts             # Application bootstrap
├── web/                     # Front‑end SPA (React‑style JavaScript)
│   ├── index.html
│   ├── dashboard/
│   ├── prospect/
│   └── thank-you/
├── docker-compose.yml       # Services definition
├── Dockerfile               # Build Docker image for the API
├── .env.example             # Example environment variables
├── package.json             # npm scripts & dependencies
└── README.md
```

### API

- **Routes**
  - `GET  /health` – Health check
  - `POST /api/prospects` – Store prospect data
  - `POST /webhooks/whatsapp` – WhatsApp webhook (currently stubbed)

- **Data storage**
  - Uses **PostgreSQL** via the `pg` library.
  - The connection string is read from `DATABASE_URL` in `.env`.

- **Background worker**
  - Listens on a Redis queue (queue name `prospects`).
  - Processes incoming prospects: logs to DB, triggers outreach notifications, etc.

---

## Local development

```bash
# Hot‑reload API
npm run dev:api            # Starts Express with ts-node-dev

# Run worker in dev mode
npm run dev:worker         # Starts worker with nodemon

# Spin up the full stack
docker compose up

# Watch TypeScript files and rebuild
npm run watch
```

> The UI is served from the `web/` directory.
> For local development, you can serve it with a simple static server:

```bash
npm install -g serve
serve web
```

---

## Docker

You can use Docker Compose to run the full stack:

```bash
docker compose up          # All services
docker compose down        # Stop everything
docker compose exec api /bin/bash   # Interactive shell in API container
```

> **No Docker profiles** are used in this project.
> If you need different deployment variants, create a separate `docker-compose.override.yml` or use environment variables.

---

## Testing

The test suite is written with **pytest** for the Python parts (database helpers) and **Jest** for the TypeScript parts.

```bash
# Run Python tests
pytest tests/ -vv

# Run TypeScript / Jest tests
npm run test
```

You can run both in one go:

```bash
npm run test-all
```

---

## Environment variables

```env
# .env.example
PORT=8880
DATABASE_URL=sqlite:///$PWD/database.sqlite
REDIS_HOST=redis
REDIS_PORT=6379
API_KEY=your_secret_api_key
```

> All services read their configuration from the same `.env` file.
> Adjust values for your environment (e.g., production, staging).

---

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1 (MVP)** | ✅ | Prospect entry form, dashboard, basic webhook stubs, DB persistence |
| **Phase 2 (Outreach & Intelligence)** | 🔍 | Owner directory CRUD, outreach generator, investigation guide |
| **Phase 3 (Voice Pipeline)** | ✅ | Audio upload UI, Whisper transcription, Ollama inference (now migrated to Cloudflare Workers AI) |

---

## Contributing

1. Fork the repo.
2. Create a feature branch (`feature/…`).
3. Run tests locally (`npm run test-all`).
4. Submit a pull request.

Feel free to open issues for bugs or feature ideas.

---

## License

MIT License – see the `LICENSE` file for details.

---

## Support

Questions can be asked on the repository's issue tracker or via the community Slack channel (link in README or `.env` example).

---