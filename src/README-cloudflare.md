# Cloudflare Workers

The Cloudflare deployment uses two Workers with separate responsibilities:

- The webhook Worker in `wrangler.toml` stores inbound audio in R2 and sends `{ audioKey, metadata }` to the `transcription` queue.
- The transcription Worker in `wrangler.transcription.toml` consumes queue batches, transcribes each R2 object, extracts insights with Workers AI, and upserts the transcript and insight payload into D1.

The queue consumer retries failed messages up to five times with a short exponential delay. Exhausted messages go to `transcription-dlq`; malformed messages, missing audio, model errors, and D1 errors also retry and eventually reach that queue. Successful messages are acknowledged only after both D1 writes complete. Unique `audio_key` values make transcript and insight redeliveries idempotent.

## Setup and deployment

1. Provision the D1 database, R2 bucket, and both queues with `scripts/create_cloudflare_resources.sh`.
2. Add the D1 `database_id` returned by Cloudflare to both Wrangler configs, and verify the account, bucket, and database names match the deployed resources.
3. Apply the schema migrations in order:
	- `wrangler d1 execute listen_engine_db --remote --file migrations/02_create_transcriptions.sql`
	- `wrangler d1 execute listen_engine_db --remote --file migrations/03_add_audio_key_to_insights.sql`
4. Deploy both Workers with `npm run deploy:cloudflare`, or deploy them independently with `npm run deploy:webhook` and `npm run deploy:transcription`.

The shared `worker-transcription.ts` and `worker-intelligence.ts` modules own the Workers AI calls. The `transcriptions` table stores the audio key, transcript, and queue metadata; `insights` stores the same audio key, transcript, and extracted insight payload.
