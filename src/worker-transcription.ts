// @ts-nocheck

import type { Env } from "./types";

export async function transcribeAudio(
  audioBlob: Blob,
  env: Env,
  ctx: ExecutionContext
): Promise<string> {
  // In a real implementation this would call the Whisper model.
  // Here we just return a placeholder.
  return "transcribed text";
}
