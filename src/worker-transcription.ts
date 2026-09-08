import type { Env } from "./types";

export async function transcribeAudio(
  audioBlob: Blob,
  env: Env,
  ctx: ExecutionContext
): Promise<string> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const whisper = await env.AI.run("@cf/openai/whisper-large-v3-turbo", {
    audio: Array.from(data),
    language: "en",
    task: "transcribe",
  });

  const key = `transcripts/${Date.now()}.txt`;
  await env.R2.put(key, whisper.chat_transcript, {
    contentType: "text/plain",
  });

  return whisper.chat_transcript;
}
