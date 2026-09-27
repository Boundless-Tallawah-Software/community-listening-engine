# Cloudflare Workers

The Cloudflare deployment uses two Workers with separate responsibilities:

- The webhook Worker in `wrangler.toml` stores inbound audio in R2 and sends `{ audioKey, metadata }` to the `transcription` queue.
- The transcription Worker in `wrangler.transcription.toml` consumes queue batches, transcribes each R2 object, extracts insights with Workers AI, and upserts the transcript and insight payload into D1.

The queue consumer retries failed messages up to five times with a short exponential delay. Exhausted messages go to `transcription-dlq`; malformed messages, missing audio, model errors, and D1 errors also retry and eventually reach that queue. Successful messages are acknowledged only after both D1 writes complete. Unique `audio_key` values make transcript and insight redeliveries idempotent.

## Setup and deployment

1. Provision the D1 database, R2 bucket, and both queues with `scripts/create_cloudflare_resources.sh`.
2. Add the D1 `database_id` returned by Cloudflare to both Wrangler configs, and verify the account, bucket, and database names match the deployed resources.
3. Apply the schema migrations with `bash scripts/migrate_d1.sh`. The script prints Wrangler's pending migration status, applies only unapplied migrations, and runs before Worker deployment in the main-branch GitHub Actions deploy job.
4. Deploy both Workers with `npm run deploy:cloudflare`, or deploy them independently with `npm run deploy:webhook` and `npm run deploy:transcription`.

The migration script first rejects partially-applied schemas, then adopts legacy migrations in Wrangler's `d1_migrations` history only when their resulting schema is present. A fresh database is left unbaselined so Wrangler applies all migrations. If a partial schema is detected (for example, the `audio_key` column exists without its unique index), the script stops before migration application and Worker deployment; repair the schema before retrying. The GitHub Actions token needs D1 write access in addition to Workers deployment access. Production deploys are serialized to prevent migration races.

The shared `worker-transcription.ts` and `worker-intelligence.ts` modules own the Workers AI calls. The `transcriptions` table stores the audio key, transcript, and queue metadata; `insights` stores the same audio key, transcript, and extracted insight payload.
