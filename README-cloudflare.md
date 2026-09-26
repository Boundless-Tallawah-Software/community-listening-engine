# Cloudflare Worker Implementation

This repository also contains a **Cloudflare Worker** deployment. The Cloudflare workers live in the `src/` directory and use Cloudflare’s edge runtime to expose webhook endpoints, queue messages and run background logic.

Build & deploy:

```bash
# build the worker bundle
wrangler build

# publish to Cloudflare
wrangler publish
```

The root `wrangler.toml` is pre‑configured for a Worker with environment variables that can be overridden through the Cloudflare dashboard or `wrangler publish`.  For details see the Cloudflare documentation.
