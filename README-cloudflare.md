# Cloudflare Worker Deployment

The deployment contains a webhook producer Worker and a dedicated transcription queue consumer. See [`src/README-cloudflare.md`](src/README-cloudflare.md) for the message flow, provisioning steps, D1 migration, dead-letter queue, and deploy commands.

## Pages frontend

The `main` CI deployment also uploads the Pages site and its Functions. Before enabling it:

1. Create a Cloudflare Pages project named `community-listening-engine` with production branch `main`.
2. The workflow hard-codes `CLOUDFLARE_PAGES_PROJECT_NAME`. The resource provisioning step resolves the D1 ID and passes it from the `test` job to `deploy`; no repository variables are needed for these two values. The existing `CLOUDFLARE_API_TOKEN` must include Pages edit access in addition to the permissions needed by the Worker and D1 deployment steps.
3. Attach `ask.boundless-tallawah.com` to the Pages project after confirming no Worker route currently owns that hostname.
4. Configure Cloudflare Access applications/policies for `/dashboard*` and `/api/v1/*` on the custom hostname and the project's `pages.dev` hostname. Keep `/prospect` and `/api/prospects` public. Access policies are account-side configuration.
5. Optionally set the GitHub Actions repository variable `CLOUDFLARE_INFORMATION_MESSAGE` to customize the prospect-page banner.

The deploy script generates a Wrangler Pages config using the hard-coded project name and the D1 ID output by resource provisioning. It declares the existing D1 database as the `DB` binding without storing its account-specific ID in the repository.

Pull requests build and bundle-check the Pages site and Functions but do not publish previews, avoiding accidental use of the production D1 binding. Confirmation emails remain deferred: the Pages form API does not use the former FastAPI SMTP implementation.
