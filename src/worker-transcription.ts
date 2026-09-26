// @ts-nocheck

import type { Env } from "./types";

export async function transcribeAudio(
  audioBlob: Blob,
  env: Env,
  ctx: ExecutionContext
): Promise<string> {
// Use Workers AI Whisper API
const result = await env.AI.run("@cf/openai/whisper", {
  audio: Array.from(new Uint8Array(audioBlob)),
  language: "en"
});
return result.chat_transcript;
}
