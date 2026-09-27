import type { TranscriptionEnv, TranscriptionQueueMessage } from "./types";
import { transcribeAudio } from "./worker-transcription.ts";

export default {
  async queue(
    batch: MessageBatch<TranscriptionQueueMessage>,
    env: TranscriptionEnv,
    ctx: ExecutionContext
  ) {
    await Promise.all(batch.messages.map(async (message) => {
      try {
        const { audioKey, metadata } = message.body;
        if (
          typeof audioKey !== "string" ||
          audioKey.trim() === "" ||
          metadata === null ||
          typeof metadata !== "object" ||
          Array.isArray(metadata)
        ) {
          throw new Error("Invalid transcription queue message");
        }

        const audioObject = await env.R2.get(audioKey);
        if (!audioObject) {
          throw new Error(`Audio object not found: ${audioKey}`);
        }

        const audio = await audioObject.arrayBuffer();
        const transcript = await transcribeAudio(new Blob([audio]), env, ctx);
        await env.DB.prepare(
          `INSERT INTO transcriptions (audio_key, transcript, metadata, created_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(audio_key) DO UPDATE SET
             transcript = excluded.transcript,
             metadata = excluded.metadata,
             created_at = excluded.created_at`
        ).bind(
          audioKey,
          transcript,
          JSON.stringify(metadata),
          new Date().toISOString()
        ).run();

        message.ack();
      } catch (error) {
        console.error("Transcription queue message failed", error);
        const delaySeconds = Math.min(300, 2 ** Math.min(message.attempts, 8));
        message.retry({ delaySeconds });
      }
    }));
  }
};