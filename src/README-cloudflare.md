# Cloudflare Workers

The Cloudflare deployment uses two Workers with separate responsibilities:

- The webhook Worker in `wrangler.toml` stores inbound audio in R2 and sends `{ audioKey, metadata }` to the `transcription` queue.
- The transcription Worker in `wrangler.transcription.toml` consumes queue batches, transcribes each R2 object with Workers AI, and upserts the transcript into D1's `transcriptions` table.

The queue consumer retries failed messages up to five times with a short exponential delay. Exhausted messages go to `transcription-dlq`; malformed messages and missing audio also retry and eventually reach that queue. Successful messages are acknowledged only after the D1 write completes. The unique `audio_key` makes redelivery idempotent.

## Setup and deployment

1. Provision the D1 database, R2 bucket, and both queues with `scripts/create_cloudflare_resources.sh`.
2. Add the D1 `database_id` returned by Cloudflare to both Wrangler configs, and verify the account, bucket, and database names match the deployed resources.
3. Apply the transcript migration: `wrangler d1 execute listen_engine_db --remote --file migrations/02_create_transcriptions.sql`.
4. Deploy both Workers with `npm run deploy:cloudflare`, or deploy them independently with `npm run deploy:webhook` and `npm run deploy:transcription`.

The existing `worker-transcription.ts` owns the Workers AI call. Insights extraction is intentionally not part of this queue job.
