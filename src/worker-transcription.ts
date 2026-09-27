// @ts-nocheck

import type { Env } from "./types";

export async function transcribeAudio(
  audioBlob: Blob,
  env: Pick<Env, "AI">,
  ctx: ExecutionContext
): Promise<string> {
  const audio = new Uint8Array(await audioBlob.arrayBuffer());
  const result = await env.AI.run("@cf/openai/whisper", {
    audio: Array.from(audio),
    language: "en"
  });
  return result.chat_transcript;
}
