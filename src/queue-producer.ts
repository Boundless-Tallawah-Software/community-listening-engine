import type { Env } from "./types";
import type { TranscriptionQueueMessage } from "./types";

export async function enqueueTranscription(
  env: Env,
  audioKey: string,
  metadata: Record<string, unknown>
) {
  const msg: TranscriptionQueueMessage = { audioKey, metadata };
  await env.JOBS.send(msg);
}
