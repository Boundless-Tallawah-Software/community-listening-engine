# 001-Cloudflare-Deploy-Guide

## Context
This guide walks through deploying a public Git repository to a Cloudflare sub‑domain, following the repository’s agent coordination guidelines. The steps are oriented toward the **Builder Agent** (DNS configuration, Pages site creation) but mention all relevant actions for developers, reviewers, and operations teams.

## Deploying a Git Repository to a Cloudflare Sub‑Domain

Below is a step‑by‑step guide to publish a public GitHub (or other VCS) repository to a sub‑domain under your Cloudflare domain. The instructions cover the *recommended* path—**Cloudflare Pages** (static sites) and **Pages Build and Deploy**—and a quick alternative using a **Cloudflare Worker** if you need something more flexible.

---

### 1. Prerequisites

| Item | What you need | Why |
|------|----------------|-----|
| Cloudflare account | An active account on https://dash.cloudflare.com | Needed for DNS and Pages |
| Domain in Cloudflare | `example.com` already added to your account | The sub‑domain will point to the repo |
| Git repo | Public GitHub/GitLab/Bitbucket repo, or a local repo that can be pushed | Pages pulls code directly from the repo |
| CLI tools (optional) | `cf` CLI, `git` | Handy but not required; you can use the UI entirely |

> **Tip** – In the UI, you’ll only need to click a few buttons, but the `cf cli` is great for scripting or if you’re comfortable with the command line.

---

### 2. Add an SSL record in DNS (A or CNAME)

Cloudflare Pages will automatically create an “A” record (IP 104.15.23.5) and a “CNAME” record, but you can also point a sub‑domain yourself.

1. In the Cloudflare dashboard, go to **DNS** → **Add record**.  
2. Choose **CNAME** (recommended for simplicity).  
3. Set:
   * **Name**: `sub` (if you want `sub.example.com`)
   * **Target**: `pages.cloudflare.com`
   * **TTL**: Automatic
4. Save.

> If you prefer an A‑record, use the IP above. Either way, Cloudflare will resolve the sub‑domain to Pages.

---

### 3. Create/Link a Cloudflare Pages Site

#### 3.1 Using the UI

1. Go to **Pages** → **Create a Project**.  
2. Choose the VCS provider (GitHub, GitLab, Bitbucket).  
3. Authorize Cloudflare, then select the repository you want to deploy.  
4. Cloudflare will auto‑detect the framework (React, Vue, Hugo, etc.) or let you choose manually.  
5. Click **Create** or **Deploy**.

#### 3.2 Using the CLI (optional)

```bash
# Install cf CLI
brew install cloudflare/cloudflare/cf

# Log in
cf auth login

# Create the project (replace placeholders)
cf pages create \
  --name myproject \
  --repo github.com/username/repo \
  --branch main \
  --output-dir dist   # or public, builds/, etc.
```

> The CLI is handy for CI pipelines or just to keep everything version‑controlled.

---

### 4. Connect the Custom Sub‑Domain

Once the site is built:

1. In the **Pages** dashboard, click the project → **Settings**.  
2. Under **Custom Domains**, click **Add custom domain**.  
3. Enter the sub‑domain you created (`sub.example.com`).  
4. Click **Continue**.  
5. Cloudflare confirms DNS records; if you already added the CNAME, it will jump straight to “Domain verified”.  
6. Click **Add domain**.

> Cloudflare Pages automatically generates an HTTPS cert via Let’s Encrypt. No manual SSL steps are required.

---

### 5. (Optional) Configure a Build Command

If the repo needs a build step (e.g., `npm install && npm run build`):

* In the **Build settings** of the Pages project, set:
  * **Build command**: `npm ci && npm run build`
  * **Build output directory**: `dist` (or whatever your framework uses)

Then click **Save**. Next deploy, and Pages will run the command automatically.

---

### 6. Deploy / Redeploy

* **Manual redeployment** – In the Pages UI, click **Deploy** (or **Redeploy** next to a particular commit).  
* **Automatic** – By default, Cloudflare Pages will deploy on every push to the configured branch (often `main`).  
* **CI/CD** – You can also trigger redeploys via the CLI (`cf pages deploy --branch main`) or via integration hooks.

---

### 7. Verify

1. Open `https://sub.example.com`.  
2. It should load your site over HTTPS, with a Cloudflare‑provided certificate (`✓`).  
3. Inspect the network tab; all static assets should be cached at Cloudflare edge.

---

## Quick Alternative: Deploy with a Cloudflare Worker

If the repo includes dynamic endpoints or you need a custom server‑side environment:

1. Create a **Worker** in the dashboard → **Workers** → **Create a script**.  
2. In the editor, paste your `index.js` that serves static files or proxies to a repo’s raw files.  
3. Add a **Route** pointing to your sub‑domain:
   `sub.example.com/*` → **Worker** → *your script*.  
4. Deploy the worker.  
5. (Optional) Add an **R2 bucket** and script logic to fetch the repo on‑demand.

**Note** – Workers are more complex to set up than Pages and aren’t suited for large static assets unless you also use R2 or Workers KV for caching.

---

### Summary

| Step | What happens |
|------|--------------|
| 1. ✅ Setup DNS CNAME | `sub.example.com → pages.cloudflare.com` |
| 2. ❯ Create Pages project | Pulls code from Git repo |
| 3. ❯ Build & Deploy | Cloudflare Pages builds automatically |
| 4. ❯ Add custom domain | HTTPS cert auto‑generated |
| 5. ✅ Verify | `https://sub.example.com` works |

That’s it! Your Git repo is now live on a Cloudflare sub‑domain. If you hit any snags, check the **Event Logs** under the Pages project for build errors or DNS misconfigurations. Happy hosting!
