# Community Listening Engine - Rollout Plan

## Overview
This document outlines the deployment and rollout plan for the Community Listening Engine.

## Current Status
- The worker builds successfully with wrangler v3.48.0
- Deployments can be performed via `wrangler deploy --temporary` (for dev/testing)

## Next Steps for Production Deployment
1. Set up Cloudflare Pages for web interface 
2. Configure routing between Pages and Workers
3. Final testing of full system integration

## Implementation Details for Web Deployment

### 1. Creating the Pages Project
To create a Cloudflare Pages project for the web interface:

1. Log into your Cloudflare dashboard
2. Navigate to "Pages" in the left sidebar
3. Click "Create a project"
4. Select your repository (community-listening-engine)
5. Set:
   - Build command: `npm run build` (if exists) or leave blank for static files 
   - Build directory: `/web`
6. Deploy

### 2. Routing Configuration

The routing between Cloudflare Pages and Workers is configured as follows:

- **Cloudflare Pages** serves all content at `https://your-domain.com/web/*`  
- **Cloudflare Worker** handles API endpoints such as:
  - `/whatsapp` (for WhatsApp webhooks)
  - `/api/...` (for REST API endpoints) 
  - `/webhooks/...` (for webhook handlers)

### 3. URL Mapping
The system will be configured to route requests like this:
- `https://your-domain.com/web/` → Cloudflare Pages (frontend UI)
- `https://your-domain.com/whatsapp` → Cloudflare Worker (WhatsApp webhook handler)
- `https://your-domain.com/api/v1/...` → Cloudflare Worker (API endpoints)
- `https://your-domain.com/webhooks/...` → Cloudflare Worker (webhook handlers)

### 4. Route Configuration
For production setup, you'll need to ensure your worker route is set correctly in the Cloudflare dashboard or via wrangler:

```
# In wrangler.toml, define routes for specific paths:
[[routes]]
pattern = "/whatsapp"
script = "community-listening-engine"

[[routes]] 
pattern = "/api/*"
script = "community-listening-engine"
```

> Note: The worker will be assigned to a default route when not explicitly defined, and the main worker functions will be accessible at the root domain.