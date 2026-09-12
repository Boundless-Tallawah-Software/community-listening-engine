// @ts-nocheck
import type { Env } from "./types";
import { transcribeAudio } from "./worker-transcription";
import { extractInsights } from "./worker-intelligence";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const msg = await request.json();
    const { audioKey, metadata } = msg as { audioKey: string; metadata: any };

    const blob = await (await env.R2.get(audioKey)).arrayBuffer();
    const transcript = await transcribeAudio(blob, env, ctx);
    const insights = await extractInsights(transcript, env, ctx);

    await env.DB.prepare(`INSERT INTO insights (audio_key, transcript, payload, created_at) VALUES (?, ?, ?, ?)`)
      .bind(audioKey, transcript, JSON.stringify(insights), new Date().toISOString()).run();

    return new Response("queued", { status: 200 });
  }
};