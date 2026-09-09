# Cloudflare API Token Permissions

The **CF_API_TOKEN** used in the CI pipeline must have the following permissions:

| Resource | Permission (must be **Edit**) | Purpose |
|----------|--------------------------------|---------|
| Workers Scripts | Edit | Deploy, list, and delete workers via `wrangler deploy`. |
| D1 Databases | Edit | Create, list, and manage the `listen_engine_db` database. |
| R2 Buckets | Edit | Create, list, and manipulate the `listen-audio` bucket. |
| KV Namespaces | Edit | Read/write to the `CACHE` namespace binding. |
| Queues | Edit | Produce messages to the `transcription` queue. |
| AI Models | Edit | Invoke AI bindings (`AI.run`) from the worker. |
| Account Settings | Edit | Create, revoke, and list API tokens. |
| Secrets (Optional) | Edit | Manage secrets via the Cloudflare API. |

**How to create the token**
1. In the Cloudflare dashboard, go to **My Profile → API Tokens** (or **Manage Account → API Tokens** for account‑level tokens).
2. Click **Create Token**.
3. Select **Custom** and add the permissions above. In the **Resources** section restrict to the specific Worker script name, database id, bucket name, KV namespace id, and queue name you’ll use.
4. Save and copy the token into the GitHub secret `CLOUDFLARE_API_TOKEN` (or `CF_API_TOKEN`).

> **Tip**: Keep the token in a **single** secret; the workflow only requires this one key.

---

> **For Obsidian**: Copy this Markdown snippet and paste it into a note in your Obsidian vault. Save the file with a `.md` extension.
