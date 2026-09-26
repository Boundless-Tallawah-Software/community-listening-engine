// @ts-nocheck
import type { Env } from "./types";

export async function enqueueTranscription(
  env: Env,
  audioKey: string,
  metadata: Record<string, any>
) {
  const msg: QueueMessage = { audioKey, metadata };
  await env.JOBS.enqueue(msg, { maxRetries: 3 });
}
