# Cloudflare Worker Implementation

This folder contains the **Cloudflare Worker** logic that handles incoming HTTP requests, processes messages from WhatsApp, and triggers background jobs for transcription and intelligence.

Key points:

* **Entry Point** – `src/whatsapp-webhook.ts` is the webhook handler used by Cloudflare.
* **Queueing** – Messages are pushed to a [Cloudflare Durable Object / Queue](https://developers.cloudflare.com/worker/queues/) for background processing.
* **Transcription/Intelligence** – Workers `worker‑transcription.ts` and `worker‑intelligence.ts` consume the queue entries and call the local Python services or external APIs.
* **Build** – Uses `wrangler.toml` in the repository root. Build and publish with:

```bash
wrangler build
wrangler publish
```

Feel free to extend this module or add new workers under the `src/` folder.
