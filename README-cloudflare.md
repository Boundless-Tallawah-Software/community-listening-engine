# Cloudflare Worker Deployment

The deployment contains a webhook producer Worker and a dedicated transcription queue consumer. See [`src/README-cloudflare.md`](src/README-cloudflare.md) for the message flow, provisioning steps, D1 migration, dead-letter queue, and deploy commands.

## Pages frontend

The `main` CI deployment uploads the Pages site and its Functions. Same-repository pull requests also receive a Pages-only preview at `pr-<number>.community-listening-engine.pages.dev`; previews do not deploy either Worker.

1. Create a Cloudflare Pages project named `community-listening-engine` with production branch `main`.
2. The workflow hard-codes `CLOUDFLARE_PAGES_PROJECT_NAME`. CI creates/resolves `listen_engine_db` for production and `listen_engine_db_staging` for Pages previews based on `DEPLOY_TARGET`, then passes both IDs to Wrangler. No repository variables are needed for these IDs. The existing `CLOUDFLARE_API_TOKEN` must include Pages edit access in addition to the permissions needed by the Worker and D1 deployment steps.
3. Attach `ask.boundless-tallawah.com` to the Pages project after confirming no Worker route currently owns that hostname.
4. Configure Cloudflare Access applications/policies for `/dashboard*` and `/api/v1/*` on the custom hostname and Pages preview hostnames. Keep `/prospect` and `/api/prospects` public. Access policies are account-side configuration.
5. Optionally set the GitHub Actions repository variable `CLOUDFLARE_INFORMATION_MESSAGE` to customize the prospect-page banner.

The deploy script generates a Wrangler Pages config using the hard-coded project name and the D1 ID output by resource provisioning. It declares the existing D1 database as the `DB` binding without storing its account-specific ID in the repository.

PR previews migrate and use only the staging D1 binding; they never migrate or write to production D1. Forked pull requests do not publish previews because their workflows cannot access the Cloudflare token. Confirmation emails remain deferred: the Pages form API does not use the former FastAPI SMTP implementation.
