// @ts-nocheck

import type { Env } from "./types";
import { transcribeAudio } from "./worker-transcription";
import { extractInsights } from "./worker-intelligence";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // This is a queue consumer worker. In Cloudflare, a consumer worker receives messages via the queue trigger and calls this fetch.
    // However, the actual queue trigger delivers messages as POST with JSON body.
    const event = await request.json();
    // Expected shape: { audioKey: string, metadata: Record<string, any> }
    const audioKey = event.audioKey;
    if (!audioKey) return new Response("missing audioKey", { status: 400 });

    // Retrieve audio blob from R2
    const blobResponse = await env.R2.get(audioKey);
    if (!blobResponse) return new Response("audio not found", { status: 404 });
    const audioBlob = await blobResponse.blob();

    try {
      const transcript = await transcribeAudio(audioBlob, env, ctx);
      const insights = await extractInsights(transcript, env, ctx);

      // Store result in DB
      await env.DB.prepare(
        `INSERT INTO insights (transcript, payload) VALUES (?, ?)`
      ).bind(transcript, JSON.stringify(insights)).run();

      return new Response("processed", { status: 200 });
    } catch (e) {
      return new Response(String(e), { status: 500 });
    }
  },
};
