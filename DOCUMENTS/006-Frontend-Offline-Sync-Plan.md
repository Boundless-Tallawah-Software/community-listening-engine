# Offline Form Capture & Sync Implementation Plan

## 1. Goal
Implement an **offline‑first** experience for the *Prospect* form so that:

1. Users can submit the form while offline.
2. Submissions are persisted locally (browser) until connectivity is restored.
3. Once back online the data is automatically sent to the backend API (`POST /api/prospects`).
4. No change to the current backend data‑model is required.
5. The PostgreSQL container used in `docker‑compose.yml` will be **disabled** until we decide to introduce a real DB for production.

---

## 2. High‑Level Architecture

```
Browser
  │
  ├─ IndexedDB (queue)
  ├─ Service‑Worker (online/on‑offline sync)
  └─ Fetch API (POST /api/prospects)

FastAPI (api‑service)
  │
  └─ SQLite (default)  ←  writes the queued data
```

- **IndexedDB** is chosen because it can store multiple entries and has a well‑documented async API.
- The **Service‑Worker** simply listens for the `online` event and drains the queue.
- The **FastAPI** service does not need any modifications – it still receives JSON objects and writes them to SQLite.

---

## 3. Step‑by‑Step Instructions

### 3.1 Build the IndexedDB Helper
Create a file `static/db.js` (or `/app/static/db.js` once built). It exposes two functions: `enqueue` and `dequeue`.

```js
// static/db.js
import { openDB } from "https://unpkg.com/idb?module";

const dbPromise = openDB("prospects-offline", 1, {
  upgrade(db) {
    db.createObjectStore("queue", { keyPath: "id", autoIncrement: true });
  },
});

export async function enqueue(data) {
  const db = await dbPromise;
  await db.put("queue", { data, status: "pending", created: Date.now() });
}

export async function dequeue() {
  const db = await dbPromise;
  const tx = db.transaction("queue", "readwrite");
  const store = tx.objectStore("queue");
  const all = await store.getAll();
  await store.clear();
  return all;
}
```

> **Tip:** The `idb` library is lightweight (≈ 10 kB gzipped) and provides a simple promise wrapper around IndexedDB.

### 3.2 Update the Form Handler
Add logic to the existing `static/app.js` (the script that already wires the form). See the snippet below:

```js
// static/app.js (add to the existing file)
import { enqueue, dequeue } from "/static/db.js";

const form = document.getElementById("prospectForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  const online = navigator.onLine;
  if (!online) {
    await enqueue(payload);
    alert("Offline – queued for later.");
    form.reset();
    return;
  }

  try {
    const res = await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Network error");
    alert("Success!");
    form.reset();
  } catch (_) {
    await enqueue(payload);
    alert("Network glitch – queued for retry.");
    form.reset();
  }
});
```

### 3.3 Register a Service Worker for Auto‑Sync
Create a file `static/worker.js` and reference it from the main page.

```js
// static/worker.js
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  self.clients.claim();
});

self.addEventListener("online", () => {
  syncQueue();
});

async function syncQueue() {
  const items = await dequeue();
  for (const { data } of items) {
    try {
      await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (_) {
      // If still failing, re‑queue the item and stop further processing
      await enqueue(data);
      break;
    }
  }
}
```

Finally, register the worker from `app.js` (just below your form logic):

```js
// static/app.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/worker.js')
    .then((reg) => console.log('SW registered', reg))
    .catch((err) => console.error('SW registration failed', err));
}
```

### 3.4 Disable the PostgreSQL Container
**Option 1 – Comment out** the `database` service in `docker-compose.yml`:

```yaml
services:
  # database:                 # <-- Comment this out
  #   image: postgres:14-alpine
  #   container_name: community_db
  #   environment:
  #     POSTGRES_USER: postgres
  #     POSTGRES_PASSWORD: my_db_pass
  #     POSTGRES_DB: communitydb
  #   volumes:
  #     - ./data/vault:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"
  #   restart: unless-stopped
```

**Option 2 – Remove the service** entirely (edit and delete the block). The API container no longer exposes a Postgres port, and the `DATABASE_URL` environment var can be omitted or pointed to a local SQLite file.

> The API service currently uses `sqlite3`. If you run into an error that it expects a Postgres URL, set
> ```
> env:
>   DATABASE_PATH: /app/data/community.db
> ```
> in the `api-service` block.

### 3.5 Rebuild & Test
```bash
# Stop existing containers
docker compose down

# Build the updated imagery
docker compose up --build -d

# Test offline capture
# 1. Disable Wi‑Fi or use incognito with no network.
# 2. Submit the prospect form – you should see "Queued for later.".
# 3. Re‑enable connectivity – the form should auto‑sync and you’ll see a success alert.
```

---

## 4. Optional Enhancements
| Feature | Why | How to Add |
|---------|-----|-------------|
| Background Sync API | Guarantees retry even if the tab is closed | `self.registration.sync.register('sync-prospects')` in the SW and handle `self.addEventListener('sync', ...)` |
| Retry Backoff | Avoid hammering server on persistent failure | Use exponential backoff and store last‑fail timestamp in IndexedDB |
| UX Indicator | Let users know queued items exist | Show a badge or toast on the UI when `queue` has length > 0 |
| Encryption | Protect data at rest in the browser | Use Web Crypto API to encrypt before storing in IndexedDB |

---

## 5. Summary
1. **Create IndexedDB helper** (`static/db.js`).
2. **Modify form** to enqueue locally when offline or POST immediately when online.
3. **Add a Service Worker** (`static/worker.js`) that drains the queue on connectivity.
4. **Comment out** or **remove** the PostgreSQL container entry in `docker-compose.yml`.
5. **Rebuild** Docker images and verify offline sync works.

Once you’re ready to bring PostgreSQL back, you’ll only need to tweak the DB wrapper in `core/database_manager.py` and adjust `DATABASE_URL`.
